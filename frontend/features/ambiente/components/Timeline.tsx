"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Timeline.module.css";

export interface RegistroTimeline {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  descricao: string;
  tags: {
    id: string;
    nome: string;
    cor: string;
  }[];
}

interface TimelineProps {
  registros: RegistroTimeline[];
}

const REGISTROS_POR_PAGINA = 6;

function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(data))
    .replace(".", "")
    .toUpperCase();
}

export default function Timeline({ registros }: TimelineProps) {
  const [inicio, setInicio] = useState(0);
  const [registroAberto, setRegistroAberto] = useState<string | null>(null);

  const detalhesRef = useRef<HTMLDivElement>(null);

  const registrosOrdenados = useMemo(
    () =>
      [...registros].sort(
        (a, b) =>
          new Date(a.data).getTime() -
          new Date(b.data).getTime()
      ),
    [registros]
  );

  const maxInicio = Math.max(
    0,
    registrosOrdenados.length - REGISTROS_POR_PAGINA
  );

  const inicioAtual = Math.min(inicio, maxInicio);

  const registrosVisiveis = registrosOrdenados.slice(
    inicioAtual,
    inicioAtual + REGISTROS_POR_PAGINA
  );

  const [animacaoInicial, setAnimacaoInicial] = useState(true);
  const [direcao, setDirecao] = useState<"direita" | "esquerda" | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimacaoInicial(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleClickFora(event: PointerEvent) {
      const alvo = event.target as Node;

      if (
        detalhesRef.current &&
        !detalhesRef.current.contains(alvo)
      ) {
        setRegistroAberto(null);
      }
    }

    document.addEventListener("pointerdown", handleClickFora);

    return () => {
      document.removeEventListener("pointerdown", handleClickFora);
    };
  }, []);

  if (registrosOrdenados.length === 0) {
    return (
      <section className={styles.timeline}>
        <p className={styles.vazio}>
          Nenhum registro encontrado.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.timeline}>
    {animacaoInicial && (
      <div
        className={styles.bolinhaInicial}
        aria-hidden="true"
      />
    )}
      <div className={styles.cabecalho}>
        {/* Integrar com o filtro de data futuramente */}
        <h2 className={styles.mes}>
          {new Intl.DateTimeFormat("pt-BR", {
            month: "long",
            year: "numeric",
          }).format(new Date())}
        </h2>

        <span className={styles.contador}>
          {registrosOrdenados.length} registros
        </span>
      </div>

      <div className={styles.navegacao}>
        <button
          type="button"
          className={styles.seta}
          onClick={() => {
            setDirecao("esquerda");
            setInicio((anterior) => Math.max(0, anterior - 3));
            setRegistroAberto(null);
          }}
          disabled={inicioAtual === 0}
          aria-label="Registros anteriores"
        >
          ‹
        </button>

        <div className={styles.trilho}>
          <div
            className={`${styles.linha} ${
              animacaoInicial ? styles.linhaAnimada : ""
            }`}
          />

          <div key={inicioAtual} className={`${styles.registros} ${
              direcao === "direita"
                ? styles.deslizarDireita
                : direcao === "esquerda"
                ? styles.deslizarEsquerda
                : ""
          }`} >
            {registrosVisiveis.map((registro) => {
              const cor = registro.tags[0]?.cor ?? "#9CAE8F";
              const aberto = registroAberto === registro.id;

              return (
                <div key={registro.id} className={styles.item}>
                  <button
                    type="button"
                    className={`${styles.ponto} ${
                      aberto ? styles.pontoAtivo : ""
                    } ${animacaoInicial ? styles.pontoAnimado : ""}`}
                    style={{ backgroundColor: cor }}
                    aria-label={`Visualizar registro ${registro.titulo}`}
                    aria-expanded={aberto}
                    onMouseEnter={() =>
                      setRegistroAberto(registro.id)
                    }
                    onFocus={() =>
                      setRegistroAberto(registro.id)
                    }
                    onClick={() => setRegistroAberto(registro.id)}
                  />

                  <span className={`${styles.data} ${
                    animacaoInicial ? styles.dataAnimada : ""
                  }`}>
                    {formatarData(registro.data)}
                  </span>

                  {aberto && (
                    <div
                      className={styles.detalhes}
                      ref={detalhesRef}
                    >
                      <div className={styles.detalhesCabecalho}>
                        <span
                          className={styles.indicador}
                          style={{
                            backgroundColor: cor,
                          }}
                        />

                        <div className={styles.identificacao}>
                          <h3 className={styles.titulo}>
                            {registro.titulo}
                          </h3>

                          <p className={styles.autor}>
                            Por {registro.autor} -{" "}
                            {formatarData(registro.data)}
                          </p>
                        </div>

                        <div className={styles.tags}>
                          {registro.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className={styles.tag}
                            >
                              {tag.nome}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          className={styles.fechar}
                          onClick={() => setRegistroAberto(null)}
                          aria-label="Fechar detalhes do registro"
                        >
                          ×
                        </button>
                      </div>

                      <div className={styles.divisor} />

                      <div className={styles.conteudo}>
                        <h4>Descrição</h4>
                        <p>{registro.descricao}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={styles.seta}
          onClick={() => {
            setDirecao("direita");
            setInicio((anterior) => Math.min(maxInicio, anterior + 3));
            setRegistroAberto(null);
          }}
          disabled={inicioAtual >= maxInicio}
          aria-label="Próximos registros"
        >
          ›
        </button>
      </div>
    </section>
  );
}
