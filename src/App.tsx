import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Componentes de Proteção
import { PrivateRoute } from "@/components/PrivateRoute";

// Páginas Públicas
import Home from "@/pages/Home";
import { Login } from "@/pages/Login";
import { RedefinirSenha } from "@/pages/RedefinirSenha";
import { Validar } from "@/pages/Validar";
import Obrigado from "@/pages/Obrigado"; // 1. IMPORTAÇÃO INCORPORADA AQUI
import AvaliacaoNeuropsicologica from "@/pages/AvaliacaoNeuropsicologica";

// Páginas do Sistema (Privadas)
import { Dashboard } from "@/pages/Dashboard";
import { CadastroUsuario } from "@/pages/CadastroUsuario"; 
import { Pacientes } from "@/pages/Pacientes"; 
import { Prontuario } from "@/pages/Prontuario";
import { Acessos } from "@/pages/Acessos"; 
import { Horarios } from "@/pages/Horarios";
import { Lembretes } from "@/pages/Lembretes";

// --- NOVAS PÁGINAS FINANCEIRAS ---
import { Planos } from "@/pages/Planos";
import { Despesas } from "@/pages/Despesas";
import { Repasses } from "@/pages/Repasses";
import { Fechamento } from "@/pages/Fechamento"; 

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/validar/:id" element={<Validar />} />
          
          {/* 2. ROTA INCORPORADA DENTRO DO BLOCO ROUTES */}
          <Route path="/obrigado" element={<Obrigado />} />
          <Route path="/avaliacao-neuropsicologica" element={<AvaliacaoNeuropsicologica />} />

          {/* Rotas Privadas (Sistema SerClin) */}
          <Route path="/sistema" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          {/* Gestão e Equipe */}
          <Route path="/sistema/lembretes" element={<PrivateRoute><Lembretes /></PrivateRoute>} />
          <Route path="/sistema/horarios" element={<PrivateRoute><Horarios /></PrivateRoute>} />
          <Route path="/sistema/acessos" element={<PrivateRoute><Acessos /></PrivateRoute>} />
          <Route path="/sistema/cadastro" element={<PrivateRoute><CadastroUsuario /></PrivateRoute>} />
          
          {/* Financeiro e Fechamento */}
          <Route path="/sistema/planos" element={<PrivateRoute><Planos /></PrivateRoute>} />
          <Route path="/sistema/despesas" element={<PrivateRoute><Despesas /></PrivateRoute>} />
          <Route path="/sistema/repasses" element={<PrivateRoute><Repasses /></PrivateRoute>} />
          <Route path="/sistema/fechamento" element={<PrivateRoute><Fechamento /></PrivateRoute>} />

          {/* Pacientes e Prontuários */}
          <Route path="/sistema/pacientes" element={<PrivateRoute><Pacientes /></PrivateRoute>} />
          <Route path="/sistema/pacientes/:id" element={<PrivateRoute><Prontuario /></PrivateRoute>} />
        </Routes>
        
        {/* Notificações flutuantes do sistema */}
        <Toaster position="top-right" />
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;