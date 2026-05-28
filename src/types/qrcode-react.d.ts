declare module "qrcode.react" {
  import * as React from "react";

  export interface QRCodeSVGProps extends React.SVGProps<SVGSVGElement> {
    value: string;
    size?: number;
    level?: "L" | "M" | "Q" | "H";
    bgColor?: string;
    fgColor?: string;
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      x?: number;
      y?: number;
      height?: number;
      width?: number;
      excavate?: boolean;
    };
  }

  export class QRCodeSVG extends React.Component<QRCodeSVGProps> {}
}
