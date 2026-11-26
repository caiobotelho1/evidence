#!/usr/bin/env python3

from collections import Counter
from datetime import date, datetime, timedelta
import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

import matplotlib.dates as mdates
import matplotlib.pyplot as plt
from matplotlib.patches import Patch, Rectangle
from matplotlib.ticker import MaxNLocator


OWNER = "caiobotelho1"
REPOSITORY = "evidence"
API_BASE = "https://api.github.com"
REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = REPO_ROOT / "docs"

LOCAL_TIMEZONE = ZoneInfo("America/Sao_Paulo")

BACKGROUND = "#0d1117"
EMPTY_CELL = "#161b22"
GRID_COLOR = "#30363d"
TEXT_COLOR = "#e6edf3"
MUTED_COLOR = "#8b949e"

# Tons semelhantes ao calendário de contribuições do GitHub.
COLORS = [
    "#161b22",
    "#0e4429",
    "#006d32",
    "#26a641",
    "#39d353",
]

MONTHS_PT = [
    "",
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]


def github_headers() -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "evidence-contribution-chart",
    }

    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    return headers


def next_page_url(link_header: str) -> str | None:
    for link in link_header.split(","):
        if 'rel="next"' in link:
            start = link.find("<")
            end = link.find(">")

            if start >= 0 and end > start:
                return link[start + 1:end]

    return None


def github_pages(url: str) -> list[dict]:
    """Consulta todas as páginas de uma lista retornada pela API do GitHub."""
    results = []

    while url:
        request = Request(url, headers=github_headers())

        try:
            with urlopen(request, timeout=30) as response:
                page = json.loads(response.read().decode("utf-8"))
                url = next_page_url(response.headers.get("Link", ""))

        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            if error.code == 403 and "rate limit" in detail.lower():
                raise RuntimeError(
                    "O GitHub limitou as consultas. Configure GITHUB_TOKEN "
                    "e execute novamente."
                ) from error

            raise RuntimeError(
                f"Erro HTTP {error.code} ao consultar o GitHub: {detail}"
            ) from error

        except URLError as error:
            raise RuntimeError(
                f"Não foi possível consultar o GitHub: {error.reason}"
            ) from error

        if not isinstance(page, list):
            raise RuntimeError("A API do GitHub retornou uma resposta inesperada.")

        results.extend(page)

    return results


def github_json(url: str) -> dict:
    request = Request(url, headers=github_headers())

    try:
        with urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))

    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"Erro HTTP {error.code} ao consultar o GitHub: {detail}"
        ) from error

    except URLError as error:
        raise RuntimeError(
            f"Não foi possível consultar o GitHub: {error.reason}"
        ) from error

    if not isinstance(result, dict):
        raise RuntimeError("A API do GitHub retornou uma resposta inesperada.")

    return result


def github_date(timestamp: str) -> date:
    """Converte o horário da API para a data local de Campo Mourão."""
    parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    return parsed.astimezone(LOCAL_TIMEZONE).date()


def get_remote_activity() -> tuple[Counter, Counter]:
    """
    Obtém dados remotos do branch padrão e dos commits de todos os PRs.

    O SHA é usado para contar cada commit uma única vez, mesmo que apareça
    no branch padrão e também na lista de commits de um PR.
    """
    repository_url = f"{API_BASE}/repos/{OWNER}/{REPOSITORY}"
    repository_info = github_json(repository_url)
    default_branch = repository_info["default_branch"]

    pulls_url = (
        f"{repository_url}/pulls"
        "?state=all&sort=created&direction=asc&per_page=100"
    )
    pull_requests = github_pages(pulls_url)

    pull_request_dates = Counter()
    commit_dates_by_sha = {}

    def add_commit(commit: dict) -> None:
        sha = commit.get("sha")
        parents = commit.get("parents", [])
        commit_info = commit.get("commit", {})
        committer = commit_info.get("committer") or {}
        author = commit_info.get("author") or {}
        timestamp = committer.get("date") or author.get("date")

        # Ignora merges para que a frequência reflita commits de trabalho.
        if not sha or len(parents) > 1 or not timestamp:
            return

        commit_dates_by_sha.setdefault(sha, github_date(timestamp))

    # Commits alcançáveis pelo branch padrão do repositório remoto.
    branch_commits_url = (
        f"{repository_url}/commits"
        f"?sha={default_branch}&per_page=100"
    )
    for commit in github_pages(branch_commits_url):
        add_commit(commit)

    # PRs de todos os estados: abertos, fechados e mesclados.
    # A data do gráfico de PR é a data de criação do PR.
    for pull_request in pull_requests:
        created_at = pull_request.get("created_at")
        if created_at:
            pull_request_dates[github_date(created_at)] += 1

        number = pull_request.get("number")
        if not number:
            continue

        commits_url = (
            f"{repository_url}/pulls/{number}/commits?per_page=100"
        )

        for commit in github_pages(commits_url):
            add_commit(commit)

    commit_dates = Counter(commit_dates_by_sha.values())
    return commit_dates, pull_request_dates


def intensity_color(value: int) -> str:
    if value <= 0:
        return COLORS[0]
    if value == 1:
        return COLORS[1]
    if value == 2:
        return COLORS[2]
    if value <= 4:
        return COLORS[3]
    return COLORS[4]


def next_month(month_start: date) -> date:
    if month_start.month == 12:
        return date(month_start.year + 1, 1, 1)

    return date(month_start.year, month_start.month + 1, 1)


def save_calendar(
    counts: Counter,
    first_day: date,
    last_day: date,
    title: str,
    output_path: Path,
) -> None:
    """Gera um calendário escuro, sem números nas células."""
    monday_before_start = first_day - timedelta(days=first_day.weekday())
    sunday_after_end = last_day + timedelta(days=6 - last_day.weekday())
    week_count = ((sunday_after_end - monday_before_start).days // 7) + 1

    figure_width = max(9, min(15, week_count * 1.1 + 3))
    figure, axis = plt.subplots(figsize=(figure_width, 3.6))
    figure.patch.set_facecolor(BACKGROUND)
    axis.set_facecolor(BACKGROUND)

    current_day = monday_before_start
    while current_day <= sunday_after_end:
        week_index = (current_day - monday_before_start).days // 7
        weekday_index = current_day.weekday()
        value = counts.get(current_day, 0)

        axis.add_patch(
            Rectangle(
                (week_index, weekday_index),
                0.78,
                0.78,
                facecolor=intensity_color(value),
                edgecolor=BACKGROUND,
                linewidth=1.2,
            )
        )

        current_day += timedelta(days=1)

    month_ticks = []
    month_labels = []
    month_start = date(first_day.year, first_day.month, 1)

    while month_start <= last_day:
        visible_month_start = max(month_start, first_day)
        week_index = (
            (visible_month_start - monday_before_start).days // 7
        )

        month_ticks.append(week_index)
        month_labels.append(MONTHS_PT[month_start.month])
        month_start = next_month(month_start)

    axis.set_title(
        title,
        color=TEXT_COLOR,
        fontsize=13,
        loc="left",
        pad=14,
    )

    axis.set_xlim(-0.2, week_count - 0.05)
    axis.set_ylim(6.9, -0.2)
    axis.set_aspect("equal")

    axis.set_xticks(month_ticks)
    axis.set_xticklabels(month_labels, color=TEXT_COLOR, fontsize=10)
    axis.xaxis.tick_top()
    axis.tick_params(axis="x", length=0, pad=8)

    weekday_positions = [0, 2, 4]
    weekday_labels = ["Seg", "Qua", "Sex"]
    axis.set_yticks(weekday_positions)
    axis.set_yticklabels(weekday_labels, color=MUTED_COLOR, fontsize=9)
    axis.tick_params(axis="y", length=0, pad=8)

    for spine in axis.spines.values():
        spine.set_visible(False)

    legend_handles = [
        Patch(facecolor=COLORS[0], label="Menos"),
        Patch(facecolor=COLORS[1], label=""),
        Patch(facecolor=COLORS[2], label=""),
        Patch(facecolor=COLORS[3], label=""),
        Patch(facecolor=COLORS[4], label="Mais"),
    ]

    figure.legend(
        handles=legend_handles,
        loc="lower right",
        ncol=5,
        frameon=False,
        labelcolor=MUTED_COLOR,
        fontsize=9,
        bbox_to_anchor=(0.97, 0.02),
        handlelength=1.0,
        handleheight=0.8,
        columnspacing=0.7,
    )

    figure.subplots_adjust(left=0.12, right=0.98, top=0.78, bottom=0.16)
    figure.savefig(
        output_path,
        dpi=180,
        facecolor=BACKGROUND,
        bbox_inches="tight",
    )
    plt.close(figure)


def save_daily_commit_chart(
    commit_counts: Counter,
    output_path: Path,
) -> None:
    """Gera gráfico de linhas somente nas datas com commits."""
    active_dates = sorted(
        day for day, count in commit_counts.items() if count > 0
    )

    if not active_dates:
        return

    values = [commit_counts[day] for day in active_dates]
    figure_width = max(12, min(22, len(active_dates) * 0.48))

    figure, axis = plt.subplots(figsize=(figure_width, 5.5))
    figure.patch.set_facecolor(BACKGROUND)
    axis.set_facecolor(BACKGROUND)

    axis.plot(
        active_dates,
        values,
        color="#a371f7",
        marker="o",
        linewidth=2,
        markersize=6,
    )

    axis.set_title(
        "Commits por dia no projeto Evidence",
        color=TEXT_COLOR,
        fontsize=14,
        pad=14,
    )
    axis.set_xlabel("Datas com commits", color=TEXT_COLOR)
    axis.set_ylabel("Quantidade de commits", color=TEXT_COLOR)
    axis.set_ylim(bottom=0)
    axis.yaxis.set_major_locator(MaxNLocator(integer=True))

    # Cada marca no eixo X corresponde a um dia que teve commits.
    axis.set_xticks(active_dates)
    axis.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m"))
    axis.tick_params(axis="x", colors=MUTED_COLOR, rotation=55, labelsize=8)
    axis.tick_params(axis="y", colors=MUTED_COLOR)

    axis.grid(axis="y", color=GRID_COLOR, alpha=0.8)
    axis.grid(axis="x", visible=False)

    for spine in axis.spines.values():
        spine.set_color(GRID_COLOR)

    figure.tight_layout()
    figure.savefig(
        output_path,
        dpi=180,
        facecolor=BACKGROUND,
        bbox_inches="tight",
    )
    plt.close(figure)


def main() -> None:
    try:
        commit_counts, pull_request_counts = get_remote_activity()
    except RuntimeError as error:
        raise SystemExit(f"Erro ao obter dados do GitHub: {error}") from error

    all_dates = set(commit_counts) | set(pull_request_counts)
    if not all_dates:
        raise SystemExit("O repositório não retornou commits nem Pull Requests.")

    first_day = min(all_dates)
    last_day = max(all_dates)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    commits_calendar = OUTPUT_DIR / "contribuicoes-commits.png"
    prs_calendar = OUTPUT_DIR / "contribuicoes-prs.png"
    commits_line_chart = OUTPUT_DIR / "commits-por-dia.png"

    save_calendar(
        commit_counts,
        first_day,
        last_day,
        "Commits da equipe",
        commits_calendar,
    )
    save_calendar(
        pull_request_counts,
        first_day,
        last_day,
        "Pull Requests criados pela equipe",
        prs_calendar,
    )
    save_daily_commit_chart(commit_counts, commits_line_chart)

    active_days = len(set(commit_counts) | set(pull_request_counts))

    print(f"Dias com atividade: {active_days}")
    print(f"Commits remotos únicos, sem merges: {sum(commit_counts.values())}")
    print(f"Pull Requests criados: {sum(pull_request_counts.values())}")
    print("Imagens geradas:")
    print(f"- {commits_calendar}")
    print(f"- {prs_calendar}")
    print(f"- {commits_line_chart}")


if __name__ == "__main__":
    main()