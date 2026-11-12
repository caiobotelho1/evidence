"use client";

import { useRef } from "react";
import styles from "./TagModal.module.css";

type TagColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

const DEFAULT_COLORS = [
  "#1F3D2F",
  "#476844",
  "#9DAD91",
  "#BB5A45",
  "#E9E0D1",
];

export default function TagColorPicker({
  value,
  onChange,
}: TagColorPickerProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.colorPicker}>
      <span className={styles.fieldLabel}>Cor</span>

      <div className={styles.colorRow}>
        {DEFAULT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`${styles.colorOption} ${
              value.toLowerCase() === color.toLowerCase()
                ? styles.colorOptionSelected
                : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Selecionar cor ${color}`}
            aria-pressed={
              value.toLowerCase() === color.toLowerCase()
            }
          />
        ))}

        <div className={styles.customColorWrapper}>
          <button
            type="button"
            className={styles.addColorButton}
            onClick={() => colorInputRef.current?.click()}
            aria-label="Escolher cor personalizada"
            title="Mais cores"
          >
            +
          </button>

          <input
            ref={colorInputRef}
            type="color"
            className={styles.nativeColorInput}
            value={value}
            onChange={(event) =>
              onChange(event.target.value.toUpperCase())
            }
            aria-label="Cor personalizada"
          />
        </div>

        <span className={styles.selectedColorLabel}>
          Cor escolhida:
        </span>

        <span
          className={styles.selectedColorPreview}
          style={{ backgroundColor: value }}
          title={value}
        />
      </div>
    </div>
  );
}