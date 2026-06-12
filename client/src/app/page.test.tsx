import { render, screen } from '@testing-library/react'
import Home from './page'

// Mock de next/image para evitar advertencias/errores en el entorno de jsdom
vi.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}))

describe('Home Page', () => {
  it('renders the Next.js logo', () => {
    render(<Home />)
    const logo = screen.getByAltText('Next.js logo')
    expect(logo).toBeInTheDocument()
  })

  it('renders the getting started heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { name: /To get started/i })
    expect(heading).toBeInTheDocument()
  })
})
