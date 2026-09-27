/**
 * PaperTexture — the subtle dot-grid that gives the canvas its paper quality.
 * Pure RN views (no SVG dep): a light lattice of 1px dots at very low opacity.
 * Noticed subconsciously, never decorative noise.
 */

import React, { useMemo } from "react";
import { View, StyleSheet, DimensionValue } from "react-native";
import { colors } from "../theme/colors";

interface PaperTextureProps {
  /** Overlay the grid on top of children (absolute) or render as a block */
  mode?: "overlay" | "block";
  style?: any;
  /** Grid cell size in dp */
  cell?: number;
}

export const PaperTexture: React.FC<PaperTextureProps> = ({
  mode = "overlay",
  style,
  cell = 22,
}) => {
  // Cap the number of dots so very tall screens stay cheap
  const maxCells = 40;

  const { rows, cols } = useMemo(() => {
    // Approximate with fixed reasonable counts; flex distributes them evenly
    return { rows: Math.min(maxCells, 26), cols: Math.min(maxCells, 18) };
  }, []);

  const dots = React.useMemo(() => {
    const arr: React.ReactNode[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        arr.push(<View key={`${r}-${c}`} style={styles.dot} />);
      }
    }
    return arr;
  }, [rows, cols]);

  return (
    <View
      pointerEvents="none"
      style={[
        mode === "overlay" ? StyleSheet.absoluteFill : styles.block,
        style,
      ]}
    >
      <View style={[styles.grid, { flexDirection: "row", flexWrap: "wrap" }]}>
        {dots}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    flex: 1,
  },
  grid: {
    width: "100%",
    height: "100%",
    justifyContent: "space-evenly",
    alignContent: "space-evenly",
  },
  dot: {
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
    backgroundColor: colors.gridDot,
    margin: 10,
  },
});
