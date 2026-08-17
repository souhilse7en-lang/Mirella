import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#4A2E38",
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#C9A961",
            lineHeight: 1,
            letterSpacing: "-0.5px",
          }}
        >
          M
        </span>
      </div>
    ),
    { ...size }
  );
}
