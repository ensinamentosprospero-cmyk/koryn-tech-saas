import { useSiteConfig } from '../../context/SiteConfigContext';
import {
  AdminGrid,
  AdminPanel,
  AdminPanelHeader,
  ConfigField,
  ConfigInput,
  ConfigSwitch,
  ConfigTextarea,
} from './AdminFormFields';

export function AdminStoreSettings() {
  const { store, updateStore } = useSiteConfig();

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Informações da marca"
        description="Aparecem no header, rodapé e áreas institucionais"
      />
      <div className="space-y-4">
        <ConfigField label="Nome da loja">
          <ConfigInput value={store.name} onChange={(value) => updateStore('name', value)} />
        </ConfigField>
        <ConfigField label="Tagline" hint="Frase curta abaixo do nome">
          <ConfigInput value={store.tagline} onChange={(value) => updateStore('tagline', value)} />
        </ConfigField>
        <ConfigField label="Descrição" hint="Texto exibido no rodapé">
          <ConfigTextarea
            value={store.description}
            onChange={(value) => updateStore('description', value)}
            rows={4}
          />
        </ConfigField>
      </div>
    </AdminPanel>
  );
}

export function AdminContactSettings() {
  const { store, updateStore } = useSiteConfig();

  return (
    <div className="space-y-5">
      <AdminPanel>
        <AdminPanelHeader title="WhatsApp" description="Principal canal de vendas" />
        <AdminGrid cols={1}>
          <ConfigField label="Número exibido">
            <ConfigInput
              value={store.phoneDisplay}
              onChange={(value) => updateStore('phoneDisplay', value)}
            />
          </ConfigField>
          <ConfigField label="Número com DDI" hint="Ex: 5538999999999">
            <ConfigInput
              value={store.phone}
              onChange={(value) => updateStore('phone', value)}
              inputMode="numeric"
            />
          </ConfigField>
        </AdminGrid>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader title="Redes e localização" />
        <div className="space-y-4">
          <AdminGrid>
            <ConfigField label="Instagram">
              <ConfigInput
                value={store.instagram}
                onChange={(value) => updateStore('instagram', value)}
              />
            </ConfigField>
            <ConfigField label="Link Instagram">
              <ConfigInput
                value={store.instagramUrl}
                onChange={(value) => updateStore('instagramUrl', value)}
              />
            </ConfigField>
          </AdminGrid>
          <AdminGrid>
            <ConfigField label="Cidade">
              <ConfigInput value={store.city} onChange={(value) => updateStore('city', value)} />
            </ConfigField>
          </AdminGrid>
        </div>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          title="Horário de atendimento"
          description="Exibido no rodapé e na área de contato do site"
        />
        <ConfigField label="Horários" hint="Uma linha por período. Ex: Segunda a Sexta: 8h às 18h">
          <ConfigTextarea
            value={store.hours}
            onChange={(value) => updateStore('hours', value)}
            rows={3}
          />
        </ConfigField>
      </AdminPanel>
    </div>
  );
}

export function AdminDeliverySettings() {
  const { store, updateStore } = useSiteConfig();

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Informações de entrega"
        description="Exibidas nos modais de produtos e ofertas"
      />
      <div className="space-y-4">
        <ConfigField label="Título">
          <ConfigInput
            value={store.deliveryTitle}
            onChange={(value) => updateStore('deliveryTitle', value)}
          />
        </ConfigField>
        <ConfigField label="Descrição completa">
          <ConfigTextarea
            value={store.deliveryDescription}
            onChange={(value) => updateStore('deliveryDescription', value)}
            rows={4}
          />
        </ConfigField>
      </div>
    </AdminPanel>
  );
}

export function AdminSectionsSettings() {
  const { sections, productsPerPage, updateSection, updateProductsPerPage } = useSiteConfig();

  return (
    <div className="space-y-5">
      <AdminPanel>
        <AdminPanelHeader
          title="Blocos da página"
          description="Ligue ou desligue cada seção do site público"
        />
        <div className="space-y-2">
          <ConfigSwitch
            label="Ofertas da semana"
            description="Carrossel de kits promocionais no topo"
            checked={sections.ofertas}
            onChange={(value) => updateSection('ofertas', value)}
          />
          <ConfigSwitch
            label="Produtos"
            description="Catálogo com busca, filtros e paginação"
            checked={sections.produtos}
            onChange={(value) => updateSection('produtos', value)}
          />
          <ConfigSwitch
            label="Dúvidas frequentes"
            description="Bloco de FAQ antes do contato"
            checked={sections.faq}
            onChange={(value) => updateSection('faq', value)}
          />
          <ConfigSwitch
            label="Chamada final"
            description="CTA de WhatsApp antes do rodapé"
            checked={sections.contato}
            onChange={(value) => updateSection('contato', value)}
          />
        </div>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader title="Catálogo" description="Comportamento da listagem de produtos" />
        <ConfigField label="Produtos por página" hint="Entre 4 e 24 itens">
          <ConfigInput
            type="number"
            min={4}
            max={24}
            value={productsPerPage}
            onChange={updateProductsPerPage}
          />
        </ConfigField>
      </AdminPanel>
    </div>
  );
}

export function AdminMessagesSettings() {
  const { messages, updateMessages } = useSiteConfig();

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Mensagem inicial"
        description="Usada nos botões gerais de WhatsApp do site"
      />
      <ConfigField label="Texto da mensagem">
        <ConfigTextarea
          value={messages.general}
          onChange={(value) => updateMessages('general', value)}
          rows={6}
        />
      </ConfigField>
    </AdminPanel>
  );
}

export function AdminAccessSettings() {
  const { auth, updateAuth } = useSiteConfig();

  return (
    <div className="space-y-5">
      <AdminPanel>
        <AdminPanelHeader
          title="Acesso do visitante"
          description="Usado no login para contato pelo WhatsApp"
        />
        <div className="space-y-4">
          <ConfigField label="E-mail do visitante">
            <ConfigInput
              type="email"
              value={auth.userEmail}
              onChange={(value) => updateAuth('userEmail', value.trim())}
              placeholder="cliente@koryntech.com"
            />
          </ConfigField>
          <ConfigField label="Senha do visitante">
            <ConfigInput
              type="password"
              value={auth.userPassword}
              onChange={(value) => updateAuth('userPassword', value)}
              placeholder="Senha do visitante"
            />
          </ConfigField>
        </div>
      </AdminPanel>

      <AdminPanel className="bg-slate-50/80">
        <AdminPanelHeader
          title="Acesso do administrador"
          description="Abre a dashboard ao fazer login"
        />
        <div className="space-y-4">
          <ConfigField label="E-mail do administrador" hint="Alteração disponível em breve">
            <ConfigInput
              type="email"
              value={auth.adminEmail}
              disabled
              placeholder="admin@koryntech.com"
            />
          </ConfigField>
          <ConfigField label="Senha do administrador" hint="Alteração disponível em breve">
            <ConfigInput
              type="password"
              value={auth.adminPassword}
              disabled
              placeholder="Senha do administrador"
            />
          </ConfigField>
        </div>
        <p className="mt-3 rounded-xl bg-white px-3 py-2.5 text-xs text-slate-500 ring-1 ring-slate-200">
          Padrão inicial: <span className="font-bold text-slate-700">admin@koryntech.com</span> /{' '}
          <span className="font-bold text-slate-700">korynadmin</span>. As alterações do visitante
          são salvas automaticamente neste navegador.
        </p>
      </AdminPanel>
    </div>
  );
}
