import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { productsService } from './services/products';
import * as auth from './services/auth';

vi.mock('./services/products', () => ({ productsService: { all: vi.fn(), getCached: vi.fn(() => null), refresh: vi.fn(), one: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() }, uploadImage: vi.fn() }));
vi.mock('./services/auth', async () => { const actual = await vi.importActual<typeof import('./services/auth')>('./services/auth'); return { ...actual, login: vi.fn() }; });
const products = [{ id: 1, title: 'Bolo de chocolate', description: 'Bolo com cobertura', oneImageUrl: '', category: 'Bolos', link: 'https://exemplo.com' }, { id: 2, title: 'Brownie intenso', description: 'Chocolate de verdade', oneImageUrl: '', category: 'Brownies', link: 'https://exemplo.com' }];
const renderApp = (entry = '/') => render(<MemoryRouter initialEntries={[entry]}><App /></MemoryRouter>);
beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); vi.mocked(productsService.all).mockResolvedValue(products); });
describe('vitrine', () => { it('carrega produtos e filtra por categoria sem nova requisição', async () => { renderApp(); expect(await screen.findByText('Bolo de chocolate')).toBeInTheDocument(); fireEvent.click(screen.getByRole('button', { name: 'Brownies' })); expect(screen.queryByText('Bolo de chocolate')).not.toBeInTheDocument(); expect(screen.getByText('Brownie intenso')).toBeInTheDocument(); expect(productsService.all).toHaveBeenCalledTimes(1); }); it('exibe lista vazia', async () => { vi.mocked(productsService.all).mockResolvedValue([]); renderApp(); expect(await screen.findByText('A vitrine está sendo preparada.')).toBeInTheDocument(); }); });
describe('autenticação', () => { it('redireciona visitante de /admin para login', async () => { renderApp('/admin'); expect(await screen.findByText('Bem-vindo de volta.')).toBeInTheDocument(); }); it('faz login e persiste o token', async () => { vi.mocked(auth.login).mockResolvedValue('jwt-teste'); renderApp('/login'); fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'admin@exemplo.com' } }); fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha-segura' } }); fireEvent.click(screen.getByRole('button', { name: 'Entrar' })); await waitFor(() => expect(auth.login).toHaveBeenCalledWith('admin@exemplo.com', 'senha-segura')); }); });
