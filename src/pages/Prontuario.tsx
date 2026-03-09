import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  ArrowLeft, User, Save, Edit, AlertCircle, 
  Paperclip, FileText, Trash2, 
  Calendar as CalendarIcon, X, RefreshCw, Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePerfil } from "@/hooks/usePerfil";

const formatarDataSegura = (data: string | null | undefined) => {
  if (!data) return "Data desconhecida";
  try { return format(new Date(data), "dd/MM/yyyy HH:mm", { locale: ptBR }); } catch (e) { return "Data inválida"; }
};

export function Prontuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSecretaria, isAdmin } = usePerfil(); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [paciente, setPaciente] = useState<any>(null);
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumoPresenca, setResumoPresenca] = useState({ presencas: 0, faltas: 0 });
  const [modoEdicao, setModoEdicao] = useState<string | null>(null);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  
  const [isAgendamentoOpen, setIsAgendamentoOpen] = useState(false);
  const [equipeClinica, setEquipeClinica] = useState<any[]>([]); 
  const [loadingAgendamento, setLoadingAgendamento] = useState(false);

  const [formAgendamento, setFormAgendamento] = useState({ 
    profissional: '', 
    sala: '1', 
    inicio: format(new Date(), "yyyy-MM-dd'T'HH:mm"), 
    duracao: '40', 
    status: 'Agendado',
    valor_atendimento: "0.00",
    forma_pagamento: "Pix"
  });

  const [novoRegistro, setNovoRegistro] = useState({ 
    tipo: isSecretaria ? "Laudo" : "Sessão", 
    descricao: "" 
  });

  const getCorProfissional = (nome: string) => {
    const prof = equipeClinica.find(p => p.nome === nome);
    return prof?.cor || "#1e3a8a";
  };

  // CARREGAR DADOS - CORREÇÃO DO ERRO 400
  const carregarDados = async () => {
    if (!id) return;
    try {
      setLoading(true);
      
      // Busca paciente garantindo que o ID seja tratado corretamente
      const { data: p, error: pError } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (pError) throw pError;
      setPaciente(p);
      
      if (p) {
        // Busca agendamentos para o resumo
        const { data: ag } = await supabase
          .from("agendamentos")
          .select("status")
          .eq("paciente_id", id);

        if (ag) {
          setResumoPresenca({
            presencas: ag.filter(a => a.status === 'Presenca' || a.status === 'Presença').length,
            faltas: ag.filter(a => a.status === 'Falta').length
          });
        }
      }

      const { data: r } = await supabase
        .from("prontuarios")
        .select("*")
        .eq("paciente_id", id)
        .order("created_at", { ascending: false });
      
      setRegistros(r || []);

      const { data: todosPerfis } = await supabase.from('perfis').select('*').order('nome');
      if (todosPerfis) {
        const filtrados = todosPerfis.filter(perfil => {
          const nome = (perfil.nome || "").toLowerCase();
          const cargo = (perfil.cargo || "").toLowerCase();
          const listaNegra = ['renata', 'instituto', 'secretaria', 'recepcao', 'admin', 'recepção'];
          return !listaNegra.some(termo => nome.includes(termo) || cargo.includes(termo));
        });
        setEquipeClinica(filtrados);
      }
    } catch (e) { 
      console.error("Erro Supabase:", e);
      toast.error("Erro ao carregar dados do paciente.");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { carregarDados(); }, [id]);

  const iniciarEdicao = (reg: any) => {
    setModoEdicao(reg.id);
    setNovoRegistro({ tipo: reg.tipo_registro, descricao: reg.descricao });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSalvarRegistro = async () => {
    if (!novoRegistro.descricao) return toast.warning("Descreva o atendimento.");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let nomeAutor = user?.email === 'romulochaves77@gmail.com' ? "Rômulo Chaves da Silva" : (user?.user_metadata?.full_name || "Profissional SerClin");
      
      let arquivoUrl: string | null = null;
      let arquivoNome: string | null = null;

      if (arquivoSelecionado) {
        const fileName = `${id}/${Date.now()}_${arquivoSelecionado.name}`;
        const { error: upErr } = await supabase.storage.from('documentos').upload(fileName, arquivoSelecionado);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('documentos').getPublicUrl(fileName);
        arquivoUrl = publicUrl;
        arquivoNome = arquivoSelecionado.name;
      }

      if (modoEdicao) {
        const registroOriginal = registros.find(r => r.id === modoEdicao);
        const versaoAntiga = {
          texto: registroOriginal.descricao,
          data: new Date().toISOString(),
          autor: registroOriginal.profissional_nome || "Desconhecido"
        };
        const historicoAtualizado = [ ...(registroOriginal.historico || []), versaoAntiga ];

        await supabase.from("prontuarios").update({
          descricao: novoRegistro.descricao,
          tipo_registro: novoRegistro.tipo,
          profissional_nome: nomeAutor,
          historico: historicoAtualizado,
          arquivo_url: arquivoUrl || registroOriginal.arquivo_url,
          arquivo_nome: arquivoNome || registroOriginal.arquivo_nome,
          updated_at: new Date().toISOString()
        }).eq("id", modoEdicao);
        toast.success("Atualizado!");
      } else {
        await supabase.from("prontuarios").insert([{
          paciente_id: id,
          tipo_registro: novoRegistro.tipo,
          descricao: novoRegistro.descricao,
          profissional_nome: nomeAutor,
          historico: [],
          arquivo_url: arquivoUrl,
          arquivo_nome: arquivoNome
        }]);
        toast.success("Salvo!");
      }

      setNovoRegistro({ tipo: isSecretaria ? "Laudo" : "Sessão", descricao: "" });
      setArquivoSelecionado(null);
      setModoEdicao(null);
      carregarDados();
    } catch (error) { toast.error("Erro ao salvar."); } finally { setLoading(false); }
  };

  const handleSalvarAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAgendamento.profissional) return toast.error("Selecione o profissional.");
    setLoadingAgendamento(true);
    try {
      const dInicio = new Date(formAgendamento.inicio);
      const dFim = addMinutes(dInicio, parseInt(formAgendamento.duracao));
      const { error } = await supabase.from('agendamentos').insert([{
        sala_id: parseInt(formAgendamento.sala),
        profissional_nome: formAgendamento.profissional,
        paciente_nome: paciente.nome,
        paciente_id: id,
        paciente_telefone: paciente.telefone,
        data_inicio: dInicio.toISOString(),
        data_fim: dFim.toISOString(),
        status: formAgendamento.status === 'Presença' ? 'Presenca' : formAgendamento.status,
        valor_atendimento: parseFloat(formAgendamento.valor_atendimento),
        forma_pagamento: formAgendamento.forma_pagamento
      }]);
      if (error) throw error;
      setIsAgendamentoOpen(false);
      toast.success("Agendado!");
      carregarDados();
    } catch (err) { toast.error("Erro ao agendar."); } finally { setLoadingAgendamento(false); }
  };

  if (loading && !paciente) return <div className="p-20 text-center font-black text-gray-400">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans text-left">
      <style>{`
        /* OUTRAS VISUALIZAÇÕES: FUNDO AZUL */
        .rbc-month-view, .rbc-time-view { 
          background-color: #1e3a8a !important; 
          color: white !important;
          border-radius: 1.5rem; overflow: hidden; border: none !important;
        }
        .rbc-header { color: white !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; }

        /* AGENDA: FUNDO BRANCO E LETRAS AZUIS */
        .rbc-agenda-view { 
          background-color: white !important; 
          border-radius: 1.5rem !important; overflow: hidden !important; 
        }
        .rbc-agenda-view table.rbc-agenda-table thead > tr > th { 
          background-color: #1e3a8a !important; 
          color: white !important; 
          font-weight: 900 !important; 
          text-transform: uppercase !important;
          padding: 16px !important;
        }
        .rbc-agenda-view table.rbc-agenda-table tbody > tr > td { 
          color: #1e3a8a !important; 
          font-weight: bold !important; 
          background-color: white !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/sistema/pacientes")} className="gap-2 text-gray-500 font-black uppercase text-xs">
            <ArrowLeft size={20} /> Voltar
          </Button>
          <div className="flex gap-2">
            {isAdmin && (
               <Button onClick={() => { if(confirm("Apagar tudo?")) supabase.from("pacientes").delete().eq("id", id).then(() => navigate("/sistema/pacientes")) }} variant="ghost" className="text-red-400 hover:text-red-600 font-black uppercase text-[10px] gap-2">
                <Trash2 size={16} /> Excluir Tudo
              </Button>
            )}
            <Button onClick={() => setIsAgendamentoOpen(true)} className="bg-[#1e3a8a] text-white font-black uppercase text-[10px] px-6 rounded-full h-10 shadow-md">
              <CalendarIcon size={16} className="mr-2" /> Agendar Consulta
            </Button>
          </div>
        </div>

        {/* INFO PACIENTE */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-[#1e3a8a] shadow-inner overflow-hidden border-2 border-white">
            {paciente?.foto_url ? <img src={paciente.foto_url} className="w-full h-full object-cover" /> : <User size={40} />}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-black text-gray-800 uppercase leading-none">{paciente?.nome}</h1>
            <p className="text-sm font-bold text-gray-400 mt-2">{paciente?.telefone} | {paciente?.convenio}</p>
          </div>
          <div className="flex gap-3 text-center">
            <div className="bg-green-50 px-5 py-2 rounded-2xl border border-green-100 min-w-[90px]">
              <p className="text-xl font-black text-green-600">{resumoPresenca.presencas}</p>
              <p className="text-[8px] font-black uppercase text-green-400">Presenças</p>
            </div>
            <div className="bg-red-50 px-5 py-2 rounded-2xl border border-red-100 min-w-[90px]">
              <p className="text-xl font-black text-red-600">{resumoPresenca.faltas}</p>
              <p className="text-[8px] font-black uppercase text-red-400">Faltas</p>
            </div>
          </div>
        </div>

        {/* ÁREA DE PRONTUÁRIO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          <div className="lg:col-span-1">
            <Card className={`border-none shadow-lg rounded-[2rem] overflow-hidden ${modoEdicao ? 'ring-4 ring-amber-400' : ''}`}>
              <div className={`${modoEdicao ? 'bg-amber-500' : 'bg-[#1e3a8a]'} px-6 py-4 text-white font-black uppercase text-[10px]`}>
                {modoEdicao ? 'Editando Registro' : 'Novo Registro'}
              </div>
              <CardContent className="p-6 space-y-4">
                <select className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-bold uppercase outline-none" value={novoRegistro.tipo} onChange={e => setNovoRegistro({...novoRegistro, tipo: e.target.value})}>
                  <option value="Sessão">Sessão</option>
                  <option value="Laudo">Laudo / PDF</option>
                  <option value="Avaliação">Avaliação</option>
                </select>
                <textarea className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm min-h-[180px] outline-none" placeholder="Relato clínico..." value={novoRegistro.descricao} onChange={e => setNovoRegistro({...novoRegistro, descricao: e.target.value})} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full border-dashed border-2 text-[10px] font-black uppercase h-12">
                  <Paperclip size={16} className="mr-2" /> {arquivoSelecionado ? arquivoSelecionado.name : "Anexar PDF"}
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setArquivoSelecionado(e.target.files?.[0] || null)} />
                <Button onClick={handleSalvarRegistro} className={`w-full text-white font-black uppercase text-xs h-12 rounded-xl shadow-lg ${modoEdicao ? 'bg-amber-600' : 'bg-[#1e3a8a]'}`}>
                  <Save size={18} className="mr-2"/> {modoEdicao ? 'Atualizar' : 'Salvar'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {registros.map((reg) => (
              <div key={reg.id} className="bg-white p-6 pl-8 rounded-[1.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-2.5" style={{ backgroundColor: getCorProfissional(reg.profissional_nome) }} />
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase px-2 py-1 bg-blue-50 text-[#1e3a8a] rounded-md">{reg.tipo_registro}</span>
                    <span className="text-[11px] font-black text-gray-800 uppercase">{reg.profissional_nome}</span>
                  </div>
                  <button onClick={() => iniciarEdicao(reg)} className="text-gray-300 hover:text-amber-500"><Edit size={16}/></button>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2">{reg.descricao}</p>
                {reg.arquivo_url && (
                  <a href={reg.arquivo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black text-[#1e3a8a] uppercase mt-3 hover:underline">
                    <FileText size={14} /> Ver Documento
                  </a>
                )}
                {reg.historico && reg.historico.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-[9px] font-black text-amber-600 uppercase cursor-pointer flex items-center gap-1"><AlertCircle size={12}/> Auditoria ({reg.historico.length})</summary>
                    <div className="mt-2 space-y-2 border-l-2 border-amber-100 pl-3">
                      {reg.historico.map((h:any, i:number) => (
                        <div key={i} className="text-[10px] text-gray-400 italic"><strong>{h.autor}</strong> em {formatarDataSegura(h.data)}</div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MODAL DE AGENDAMENTO (PADRÃO 420px) */}
        {isAgendamentoOpen && (
          <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setIsAgendamentoOpen(false)}>
            <Card className="w-full max-w-[420px] rounded-[2.5rem] bg-white overflow-visible shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="bg-[#1e3a8a] p-5 flex justify-between items-center rounded-t-[2.5rem]">
                <h3 className="font-black uppercase text-[11px] tracking-widest text-white !important">Agendar: {paciente?.nome}</h3>
                <button onClick={() => setIsAgendamentoOpen(false)} className="text-white hover:opacity-70 transition-opacity"><X size={22}/></button>
              </div>
              <form onSubmit={handleSalvarAgendamento} className="p-6 space-y-4 text-left">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Status</label>
                    <Select value={formAgendamento.status} onValueChange={(v) => setFormAgendamento({...formAgendamento, status: v})}>
                      <SelectTrigger className="bg-blue-50 border-none font-bold text-blue-700 h-10 uppercase text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent className="z-[1000]"><SelectItem value="Agendado">Agendado</SelectItem><SelectItem value="Presença">Presença</SelectItem><SelectItem value="Falta">Falta</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Pagamento</label>
                    <Select value={formAgendamento.forma_pagamento} onValueChange={(v) => setFormAgendamento({...formAgendamento, forma_pagamento: v})}>
                      <SelectTrigger className="bg-emerald-50 border-none font-bold text-emerald-700 h-10 text-[10px] uppercase"><SelectValue /></SelectTrigger>
                      <SelectContent className="z-[1000]">
                        <SelectItem value="Pix">Pix</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Cartão de Crédito">Cartão Crédito</SelectItem>
                        <SelectItem value="Cartão de Débito">Cartão Débito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Valor Sessão</label>
                    <Input type="number" step="0.01" value={formAgendamento.valor_atendimento} onChange={e => setFormAgendamento({...formAgendamento, valor_atendimento: e.target.value})} className="bg-gray-50 border-none h-10 font-bold text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Duração</label>
                    <Select value={formAgendamento.duracao} onValueChange={(v) => setFormAgendamento({...formAgendamento, duracao: v})}>
                      <SelectTrigger className="bg-gray-50 border-none h-10 font-bold text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="z-[1000]">
                        <SelectItem value="30">30 Min</SelectItem><SelectItem value="40">40 Min</SelectItem>
                        <SelectItem value="50">50 Min</SelectItem><SelectItem value="60">60 Min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Profissional</label>
                    <Select value={formAgendamento.profissional} onValueChange={(v) => setFormAgendamento({...formAgendamento, profissional: v})} required>
                      <SelectTrigger className="bg-gray-50 border-none h-10 font-bold text-sm uppercase"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent className="z-[1000]">
                        {equipeClinica.map(p => <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Sala</label>
                    <Select value={formAgendamento.sala} onValueChange={(v) => setFormAgendamento({...formAgendamento, sala: v})}>
                      <SelectTrigger className="h-10 text-xs font-bold uppercase border-none bg-gray-50"><SelectValue /></SelectTrigger>
                      <SelectContent className="z-[1000]"><SelectItem value="1">Sala 01</SelectItem><SelectItem value="2">Sala 02</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Data e Horário</label>
                  <input type="datetime-local" className="w-full h-10 bg-gray-50 border-none rounded-xl px-4 text-xs font-bold outline-none" value={formAgendamento.inicio} onChange={e => setFormAgendamento({...formAgendamento, inicio: e.target.value})} />
                </div>

                <Button type="submit" disabled={loadingAgendamento} className="w-full bg-[#1e3a8a] hover:bg-black text-white font-black uppercase text-xs h-14 rounded-2xl shadow-xl transition-all">
                  {loadingAgendamento ? <RefreshCw className="animate-spin" /> : "Confirmar Agendamento"}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
