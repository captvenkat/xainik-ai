/**
 * External type declarations for third-party libraries
 */

declare module 'fontkit' {
  const fontkit: any
  export default fontkit
}

declare module '@react-pdf/font' {
  const font: any
  export default font
}

declare module 'unplugin' {
  const x: any
  export default x
}

// React-PDF minimal helpers
declare module '@react-pdf/renderer' {
  export const Document: any
  export const Page: any
  export const Text: any
  export const View: any
  export const StyleSheet: any
  export const PDFViewer: any
  export const pdf: any
  export const Image: any
  export const Font: any
  export const renderToBuffer: any
  export const renderToStream: any
  export const renderToString: any
}

// Override problematic rollup types
declare module 'rollup' {
  interface AcornNode {
    // Minimal interface to satisfy unplugin
  }
}
