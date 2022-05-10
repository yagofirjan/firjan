export interface IApiSwaggerListItem {

    login: string;
    matricula: number;
    digitoMatricula: number;
    idPessoaFisica: number;
    nome: string;
    email: string;
    dataNascimento: any;
    dataAdmissao: any;
    dataDesligamento: any;
    dataTransferencia: any;
    dataTerminoContrato: any;
    ativo: any;
    idHorarioForPonto: string;
    descricaoHorarioForPonto: string;
    intermitente: true;
    pcd: true;
    grupoSalarial: number;
    empresa: {
        id: number;
        nome: string;
    };
    estabelecimento: {
        id: number;
        nome: string;
        cnpj: string;
        idEmpresa: number;
        cnae: number;
        pessoaJuridica: {
            id: number;
            endereco: string;
            complemento: string;
            numero: number;
            bairro: string;
            cidade: string;
            cep: number;
            ddd: number;
            telefone: number;
            idInscricaoEstadual: number;
            inscricaoEstadual: string
        }
    };
    itemContabil: {
        id: string;
        descricao: string
    };
    turnoTrabalho: {
        id: number;
        qtdHorasTrabalhoSemana: number;
        qtdHorasTrabalhoMes: number
    };
    tipoContratacao: {
        id: number;
        descricao: string
    };
    estruturaSalarial: {
        id: number;
        descricao: string
        lotacao: {
            id: string;
            descricao: string;
            idPlanoLotacao: number;
            existeLotacaoSubordinada: true;
            vinculadaFuncaoChefia: true;
            ativa: true
        };
        localFisico: {
            id: number;
            descricao: string
        };
        centroCusto: {
            id: string;
            descricao: string;
            ativo: true
        };
        remuneracao: {
            salario: string;
            remuneracoesVariaveis: {
                insalubridade: true;
                periculosidade: true;
                pcmso: true
            }
        };
        documentacao: {
            cpf: string;
            pis: string;
            rg: string;
            ufRg: string;
            orgaoExpedidorRG: string;
            numeroCarteiraTrabalho: string;
            serieCarteiraTrabalho: string;
            ufCarteiraTrabalho: string;
            idSexo: number;
            sexo: string;
            idEstadoCivil: number;
            estadoCivil: string;
            nomePai: string;
            nomeMae: string;
            idCorCutis: number;
            corCutis: string;
            idFormacaoAcademica: number;
            formacaoAcademica: string;
            siglaPaisNaturalidade: string;
            siglaPaisNacionalidade: string;
            descricaoPaisNacionalidade: string;
            naturalidade: string;
            ufNacionalidade: string
        };
        contato: {
            endereco: {
                logradouro: string;
                cidade: string;
                bairro: string,
                cep: number,
                uf: string,
                siglaPais: string
            },
            telefones: [
                {
                    ddd: number,
                    numero: number
                }
            ]
        },
        gestor: {
            login: string,
            matricula: number,
            digitoMatricula: number,
            idPessoaFisica: number,
            nome: string,
            email: string,
            dataNascimento: any;
            dataAdmissao: any;
            dataDesligamento: any;
            dataTransferencia: any;
            dataTerminoContrato: any;
            ativo: true,
            idHorarioForPonto: string,
            descricaoHorarioForPonto: string,
            intermitente: true,
            pcd: true,
            grupoSalarial: number,
            empresa: {
                id: number,
                nome: string
            },
            estabelecimento: {
                id: number,
                nome: string,
                cnpj: string,
                idEmpresa: number,
                cnae: number,
                pessoaJuridica: {
                    id: number,
                    endereco: string,
                    complemento: string,
                    numero: number,
                    bairro: string,
                    cidade: string,
                    cep: number,
                    ddd: number,
                    telefone: number,
                    idInscricaoEstadual: number,
                    inscricaoEstadual: string
                }
            },
            itemContabil: {
                id: string,
                descricao: string
            },
            cargo: {
                id: number,
                nome: string,
                nivel: number,
                cbo: number,
                especialidade: string,
                classificacao: number,
                ativo: true,
                familiaCargo: {
                    id: 11,
                    descricao: string
                },
                nivelHierarquicoFuncional: {
                    id: number,
                    descricao: string,
                    funcaoChefia: true
                }
            },
            turnoTrabalho: {
                id: number,
                qtdHorasTrabalhoSemana: number,
                qtdHorasTrabalhoMes: number
            },
            tipoContratacao: {
                id: 1,
                descricao: string
            },
            estruturaSalarial: {
                id: 1,
                descricao: string
            },
            lotacao: {
                id: string,
                descricao: string,
                idPlanoLotacao: number,
                existeLotacaoSubordinada: true,
                vinculadaFuncaoChefia: true,
                ativa: true
            },
            localFisico: {
                id: number,
                descricao: string
            },
            centroCusto: {
                id: string,
                descricao: string,
                ativo: true
            },
            remuneracao: {
                salario: string,
                remuneracoesVariaveis: {
                    insalubridade: true,
                    periculosidade: true,
                    pcmso: true
                }
            },
            documentacao: {
                cpf: string,
                pis: string,
                rg: string,
                ufRg: string,
                orgaoExpedidorRG: string,
                numeroCarteiraTrabalho: string,
                serieCarteiraTrabalho: string,
                ufCarteiraTrabalho: string,
                idSexo: number,
                sexo: string,
                idEstadoCivil: number,
                estadoCivil: string,
                nomePai: string,
                nomeMae: string,
                idCorCutis: number,
                corCutis: string,
                idFormacaoAcademica: number,
                formacaoAcademica: string,
                siglaPaisNaturalidade: string,
                siglaPaisNacionalidade: string,
                descricaoPaisNacionalidade: string,
                naturalidade: string,
                ufNacionalidade: string
            },
            contato: {
                endereco: {
                    logradouro: string,
                    cidade: string,
                    bairro: string,
                    cep: number,
                    uf: string,
                    siglaPais: string
                },
                telefones: [
                    {
                        ddd: number,
                        numero: number
                    }
                ]
            },
            gestor: string,
            ultimaMovimentacaoSalarial: {
                dataMovimentacao: any,
                idTipoMovimentacao: number,
                descricaoMovimentacao: string,
                salarioMovimentacao: string,
                percentAumentoMovAnterior: string
            }
        },
        ultimaMovimentacaoSalarial: {
            dataMovimentacao: any,
            idTipoMovimentacao: number,
            descricaoMovimentacao: string,
            salarioMovimentacao: string,
            percentAumentoMovAnterior: string
        }
    };
}
