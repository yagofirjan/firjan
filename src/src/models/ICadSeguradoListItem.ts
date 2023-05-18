export interface ICadSeguradoListItem {

    ID: number;
    Nome: string;
    CPF:string;
    DataNascimento:string;
    Matricula:string;
    Empresa:string;
    Estabelecimento:string;
    Lotacao:string;
    Estado:string;
    DataAssinatura:string;
    Status:string;
    Login:string;
    Motivo:string;
    MotivoCancelamento: string;
    Author: string;
    Assinatura:string;

    Attachments: string;
    AttachmentFiles: [{        
        Title: string;
        id: number;
        ServerRelativeUrl: string;
        Attachments: boolean;
    }];
   

    }