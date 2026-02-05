
import { FiscalContext } from "../core";
import { FiscalRulesEngine } from "../rules";

export class NuvemfiscalMapper {
  static mapToNfe(ctx: FiscalContext) {
    const { empresa, cliente, produto, orcamento, infoInsumos, rules } = ctx;

    return {
      infNFe: {
        versao: "4.00",
        ide: {
          cUF: FiscalRulesEngine.getUfCode(empresa.estado),
          natOp: "Venda de producao do estabelecimento",
          mod: 55,
          serie: 1,
          dhEmi: new Date().toISOString(),
          tpNF: 1,
          idDest: empresa.estado === cliente.estado ? 1 : 2,
          cMunFG: empresa.cidadeIbge,
          tpImp: 1,
          tpEmis: 1,
          tpAmb: 2, // Sandbox por padrão para segurança, injetar via config se real
          finNFe: 1,
          indFinal: 1,
          indPres: 1,
          procEmi: 0,
          verProc: "MeuConcreto_1.0"
        },
        emit: {
          CNPJ: empresa.cnpj.replace(/\D/g, ""),
          xNome: empresa.empresa,
          xFant: empresa.empresa,
          enderEmit: {
            xLgr: empresa.endereco || "Nao informado",
            nro: empresa.numero || "SN",
            xCpl: empresa.complemento,
            xBairro: empresa.bairro || "Centro",
            cMun: empresa.cidadeIbge,
            xMun: empresa.cidade,
            UF: empresa.estado,
            CEP: empresa.cep ? empresa.cep.replace(/\D/g, "") : "",
            cPais: "1058",
            xPais: "BRASIL"
          },
          IE: empresa.ie ? empresa.ie.replace(/\D/g, "") : "",
          CRT: empresa.crt || 1
        },
        dest: {
          CNPJ: cliente.cpfCnpj.length > 11 ? cliente.cpfCnpj.replace(/\D/g, "") : undefined,
          CPF: cliente.cpfCnpj.length <= 11 ? cliente.cpfCnpj.replace(/\D/g, "") : undefined,
          xNome: cliente.nome,
          enderDest: {
            xLgr: cliente.endereco || "Nao informado",
            nro: cliente.numero || "SN",
            xCpl: cliente.complemento,
            xBairro: cliente.bairro || "Centro",
            cMun: cliente.cidadeIbge,
            xMun: cliente.cidade,
            UF: cliente.estado,
            CEP: cliente.cep ? cliente.cep.replace(/\D/g, "") : "",
            cPais: "1058",
            xPais: "BRASIL"
          },
          indIEDest: 9,
          email: cliente.email
        },
        det: [
          {
            nItem: 1,
            prod: {
              cProd: produto.id.toString(),
              cEAN: "SEM GTIN",
              xProd: produto.produto + (produto.fck ? ` FCK ${produto.fck}` : ""),
              NCM: produto.ncm || "38245000",
              CFOP: rules.cfop,
              uCom: produto.unidadeMedida || "m3",
              qCom: orcamento.qtd,
              vUnCom: orcamento.valorUnit / 100,
              vProd: orcamento.total / 100,
              cEANTrib: "SEM GTIN",
              uTrib: produto.unidadeMedida || "m3",
              qTrib: orcamento.qtd,
              vUnTrib: orcamento.valorUnit / 100,
              indTot: 1,
              cBenef: rules.cBenef
            },
            imposto: {
              vTotTrib: (orcamento.total / 100) * rules.aliqIBPT,
              ICMS: {
                ICMSSN102: {
                  orig: produto.origem || 0,
                  CSOSN: rules.csosn
                }
              },
              PIS: { PISOutr: { vBC: 0, pPIS: 0, vPIS: 0, CST: rules.cstPIS } },
              COFINS: { COFINSOutr: { vBC: 0, pCOFINS: 0, vCOFINS: 0, CST: rules.cstCOFINS } },
              // Reforma Tributaria 2026 - IBS/CBS
              IBS: {
                  vBC: orcamento.total / 100,
                  pIBS: Number((rules.aliqIBS * 100).toFixed(2)),
                  vIBS: Number(((orcamento.total / 100) * rules.aliqIBS).toFixed(2))
              },
              CBS: {
                  vBC: orcamento.total / 100,
                  pCBS: Number((rules.aliqCBS * 100).toFixed(2)),
                  vCBS: Number(((orcamento.total / 100) * rules.aliqCBS).toFixed(2))
              }
            }
          }
        ],
        total: {
          ICMSTot: {
            vBC: 0, vICMS: 0, vICMSDeson: 0, vFCP: 0, vBCST: 0, vST: 0,
            vFCPST: 0, vFCPSTRet: 0, vProd: orcamento.total / 100,
            vFrete: 0, vSeg: 0, vDesc: (orcamento.valorDesconto || 0) / 100,
            vII: 0, vIPI: 0, vIPIDevol: 0, vPIS: 0, vCOFINS: 0, vOutro: 0,
            vNF: orcamento.total / 100,
            // Totais Reforma Tributaria
            vIBS: Number(((orcamento.total / 100) * rules.aliqIBS).toFixed(2)),
            vCBS: Number(((orcamento.total / 100) * rules.aliqCBS).toFixed(2))
          }
        },
        transp: { modFrete: 0 },
        infAdic: {
          infCpl: `Referente a entrega em ${orcamento.cidade}. ${infoInsumos}. ${rules.textoComplementar}`
        }
      }
    };
  }

  static mapToNfse(ctx: FiscalContext) {
    const { empresa, cliente, produto, orcamento, rules } = ctx;
    
    // Nuvem Fiscal Emissão NFS-e (Padrão Nacional DPS - Layout 2026)
    // Conforme o Request Body schema fornecido para o Padrão Nacional
    return {
      // Removendo 'provedor' e 'referencia' da raiz pois foram rejeitados pela API na tentativa anterior
      infDPS: {
        tpAmb: 2, // 1-Produção, 2-Homologação. Sincronizado pelo service.
        dhEmi: new Date().toISOString(),
        verAplic: "MeuConcreto_1.0",
        dCompet: new Date().toISOString().split("T")[0],
        prest: {
          CNPJ: empresa.cnpj.replace(/\D/g, ""),
          regTrib: {
             regEspTrib: empresa.crt === 1 ? 6 : 0 // 6=ME/EPP Simples Nacional
          }
        },
        toma: {
          orgaoPublico: false,
          CNPJ: cliente.cpfCnpj.length > 11 ? cliente.cpfCnpj.replace(/\D/g, "") : undefined,
          CPF: cliente.cpfCnpj.length <= 11 ? cliente.cpfCnpj.replace(/\D/g, "") : undefined,
          xNome: cliente.nome.substring(0, 300),
          end: {
            endNac: {
              cMun: cliente.cidadeIbge,
              CEP: cliente.cep ? cliente.cep.replace(/\D/g, "") : ""
            },
            xLgr: (cliente.endereco || "Nao informado").substring(0, 255),
            nro: (cliente.numero || "SN").substring(0, 60),
            xCpl: (cliente.complemento || "").substring(0, 156),
            xBairro: (cliente.bairro || "Centro").substring(0, 60)
          },
          email: cliente.email?.substring(0, 80)
        },
        serv: {
          locPrest: {
            cLocPrestacao: cliente.cidadeIbge || empresa.cidadeIbge
          },
          cServ: {
            cTribNac: "070201", // Execução de obras civil
            cTribMun: empresa.codigoServicoMunicipal || "07.02",
            xDescServ: `${produto.produto} - ${ctx.infoInsumos}`.substring(0, 1000)
          }
        },
        valores: {
          vServPrest: {
            vServ: orcamento.total / 100
          },
          trib: {
            tribMun: {
              tribISSQN: 1, // 1-Operação tributável
              tpRetISSQN: 1, // 1-Não retido
              pAliq: Number((rules.aliqISS * 100).toFixed(2)),
              vBC: orcamento.total / 100,
              vISSQN: Number(((orcamento.total / 100) * rules.aliqISS).toFixed(2))
            }
          }
        },
        IBSCBS: {
          finNFSe: 1, // 1-Normal
          indFinal: 1, // 1-Consumidor Final
          indDest: 0, // 0-Operação Interna
          tpOper: 1, // 1-Saída
          valores: {
            trib: {
              gIBSCBS: {
                // No Padrão Nacional 2026, as alíquotas e valores de IBS/CBS 
                // seguem dentro do grupo gIBSCBS ou gTribRegular dependendo do CST
                vBC: orcamento.total / 100,
                pIBS: Number((rules.aliqIBS * 100).toFixed(2)),
                vIBS: Number(((orcamento.total / 100) * rules.aliqIBS).toFixed(2)),
                pCBS: Number((rules.aliqCBS * 100).toFixed(2)),
                vCBS: Number(((orcamento.total / 100) * rules.aliqCBS).toFixed(2))
              }
            }
          }
        }
      }
    };
  }
}
