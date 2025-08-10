// Mock for @react-pdf/renderer
export const renderToBuffer = jest.fn().mockResolvedValue(Buffer.from('mock-pdf-content'))

export const Document = ({ children }: { children: React.ReactNode }) => children
export const Page = ({ children }: { children: React.ReactNode }) => children
export const Text = ({ children }: { children: React.ReactNode }) => children
export const View = ({ children }: { children: React.ReactNode }) => children
export const StyleSheet = {
  create: (styles: any) => styles
}
export const Font = {
  register: jest.fn()
}
