import { ref } from "vue";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const toasts = ref<Toast[]>([]);
let counter = 0;

export const useToast = () => {
  const add = (
    message:
      | string
      | {
          title?: string;
          description?: string;
          message?: string;
          type?: Toast["type"] | "warn";
        },
    type: Toast["type"] | "warn" = "success",
  ) => {
    const id = ++counter;
    let finalMessage = "";

    if (typeof message === "string") {
      finalMessage = message;
    } else {
      finalMessage =
        message.description ||
        message.message ||
        message.title ||
        "Notificação";
      if (message.type) type = message.type as any;
    }

    // Map types for internal logic
    const finalType = type;

    // Sanitiza mensagens de erro genéricas do servidor para o usuário
    if (finalType === "error") {
      const genericTerms = [
        "internal server error",
        "fetch error",
        "500",
        "network error",
        "undefined",
        "object object",
      ];
      const isGeneric = genericTerms.some((term) =>
        finalMessage.toLowerCase().includes(term),
      );

      if (isGeneric || !finalMessage) {
        finalMessage =
          "Não foi possível completar a operação. O servidor encontrou uma instabilidade temporária.";
      }
    }

    toasts.value.push({ id, message: finalMessage, type: finalType as any });
    setTimeout(() => {
      remove(id);
    }, 5000);
  };

  const remove = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  return {
    toasts,
    add,
    remove,
  };
};
