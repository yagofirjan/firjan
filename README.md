# Introdução
O Formulário de Solicitação de Seguro de Vida, tem por objetivo, apoiar no controle da GAP e facilitar os colaboradores na manutenibilidade de seu benefício.

# Acesso e Autenticação

O Formulário de Solicitação de Seguro de Vida tem a segurança atrelada ao login na plataforma SharePoint, sendo o formulário acima, um appCatalog inserido na plataforma. 

# Cliente

O principal cliente e usuário homologador é o colaborador **Bruno de Oliveira Silva**.

# Arquitetura da Aplicação
A solução do formulário se baseia em projetos SPFX.

Segue abaixo a lista dos principais pacotes/plugins que o formulário utiliza, todos instalados via NPM:

- **MSAL** - Responsável pela autenticação em APIS no contexto do usuário logado;
- **microsoft/sp-webpart-base** - Responsável por gerar a solution e conseguir criar código com typescript;
- **@microsoft/sp-http** - Responsável por acessar listas SharePoint.

