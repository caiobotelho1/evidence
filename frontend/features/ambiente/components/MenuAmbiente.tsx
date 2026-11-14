import Link from "next/link";
import Image from "next/image";

import iconRegistro from "../../../imgs/icon_registro.png";
import iconTag from "../../../imgs/icon_tag.png";
import iconConfiguracoes from "../../../imgs/icon_configuracoes.png";
import iconSair from "../../../imgs/icon_sair.png";
import iconEquipe from "../../../imgs/icon_equipe.png";

import styles from "./MenuAmbiente.module.css";

type Ambiente = "pessoal" | "empresa";
type PapelEmpresa = "proprietario" | "funcionario";

interface MenuAmbienteProps {
  ambiente: Ambiente;
  papelEmpresa?: PapelEmpresa;
}

interface MenuAmbienteProps {
  ambiente: "pessoal" | "empresa";
  papelEmpresa?: "proprietario" | "funcionario";
  onCriarTag: () => void;
}

export default function MenuAmbiente({
  ambiente,
  papelEmpresa,
  onCriarTag,
}: MenuAmbienteProps) {
  const isPessoal = ambiente === "pessoal";
  const isProprietario =
    ambiente === "empresa" && papelEmpresa === "proprietario";

  return (
    <nav
      className={styles.menu}
      aria-label="Menu do ambiente atual"
    >
      <Link href="/registro" className={styles.menuItem}>
        <Image src={iconRegistro} alt="" width={20} height={20} />
        <span>Registros</span>
      </Link>

      {(isPessoal || isProprietario) && (
        <button
          type="button"
          className={styles.menuItem}
          onClick={onCriarTag}
        >
          <Image src={iconTag} alt="" width={20} height={20} />
          <span>Criar tag</span>
        </button>
      )}

      {isProprietario && (
        <Link href="/empresa" className={styles.menuItem}>
          <Image
            src={iconEquipe}
            alt=""
            width={20}
            height={20}
          />
          <span>Empresa</span>
        </Link>
      )}

      <Link href="/configuracoes" className={styles.menuItem}>
        <Image
          src={iconConfiguracoes}
          alt=""
          width={20}
          height={20}
        />
        <span>Configurações</span>
      </Link>

      <div className={styles.divider} />

    <Link
      href="/login"
      className={`${styles.menuItem} ${styles.logout}`}
    >
      <Image src={iconSair} alt="" width={20} height={20} />
      <span>Sair</span>
    </Link>
    </nav>
  );
}
