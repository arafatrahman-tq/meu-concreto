import { useAuth } from "./useAuth";

export interface LogData {
  nivel: "INFO" | "WARN" | "ERROR" | "DEBUG";
  modulo: string;
  mensagem: string;
  dados?: any;
}

export const useLogger = () => {
  const { user } = useAuth();

  const log = async (data: LogData) => {
    try {
      const payload = {
        ...data,
        dados: data.dados ? JSON.stringify(data.dados) : undefined,
        idUsuario: user.value?.id,
        idEmpresa: user.value?.idEmpresa,
      };

      await $fetch("/api/system-logs", {
        method: "POST",
        body: payload,
      });
    } catch (err) {
      console.error("Falha ao registrar log no servidor:", err);
    }
  };

  return {
    log,
    info: (modulo: string, mensagem: string, dados?: any) =>
      log({ nivel: "INFO", modulo, mensagem, dados }),
    warn: (modulo: string, mensagem: string, dados?: any) =>
      log({ nivel: "WARN", modulo, mensagem, dados }),
    error: (modulo: string, mensagem: string, dados?: any) =>
      log({ nivel: "ERROR", modulo, mensagem, dados }),
    debug: (modulo: string, mensagem: string, dados?: any) =>
      log({ nivel: "DEBUG", modulo, mensagem, dados }),
  };
};
