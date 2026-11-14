import styles from "./MenuTags.module.css";

export interface Tag {
  id: string;
  nome: string;
  cor: string;
}

interface MenuTagsProps {
  tags: Tag[];
}

export default function MenuTags({ tags }: MenuTagsProps) {
  return (
    <div className={styles.menuTags}>
      <h2 className={styles.titulo}>Tags</h2>

      <div className={styles.listaTags}>
        {tags.length > 0 ? (
          tags.map((tag) => (
            <div key={tag.id} className={styles.tagItem}>
              <span
                className={styles.circulo}
                style={{ backgroundColor: tag.cor }}
                aria-hidden="true"
              />

              <span>{tag.nome}</span>
            </div>
          ))
        ) : (
          <p className={styles.mensagemVazia}>
            Nenhuma tag cadastrada.
          </p>
        )}
      </div>
    </div>
  );
}
