import { Card } from '@/components/ui/card';
import { Users, FileText, Settings, BarChart } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-8">Painel Administrativo</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Usuários</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">89</p>
              <p className="text-sm text-muted-foreground">Contratos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <BarChart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ 45k</p>
              <p className="text-sm text-muted-foreground">Receita Mensal</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Configurações</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Painel Administrativo</h3>
        <p className="text-muted-foreground">
          Gerencie todos os aspectos do sistema, usuários e configurações.
        </p>
      </Card>
    </div>
  );
}
