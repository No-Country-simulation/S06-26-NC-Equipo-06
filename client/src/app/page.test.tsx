import { render, screen } from '@testing-library/react'
import Home from './page'
import useAuth from '@/hooks/useAuth'

// Mock de useAuth para evitar que falle por la falta de AuthProvider
vi.mock('@/hooks/useAuth', () => ({
  default: () => ({
    logout: vi.fn(),
    isAuthenticated: false,
    role: null,
  })
}))

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
  it('renders the main heading and subtitles', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { 
      name: /el estándar digital para las contrataciones públicas en el perú/i 
    })
    expect(heading).toBeInTheDocument()

    const subtitle = screen.getByText(/transparencia y eficiencia/i)
    expect(subtitle).toBeInTheDocument()
  })

  it('renders the call to action buttons', () => {
    render(<Home />)
    
    expect(screen.getByRole('button', { name: /registrar mi empresa/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /demo para entidades/i })).toBeInTheDocument()
  })

  it('renders the pricing plans sections', () => {
    render(<Home />)
    
    expect(screen.getByText(/plan proveedor/i)).toBeInTheDocument()
    expect(screen.getByText(/plan institucional/i)).toBeInTheDocument()
  })
})
