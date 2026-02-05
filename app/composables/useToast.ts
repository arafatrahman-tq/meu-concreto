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
      | { title?: string; description?: string; message?: string; type?: Toast["type"] | "warn" },
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

    // Map "warn" to "info" for visual consistency if "warn" isn't a primary type, 
    // or keep it if the UI component handles it.
    const finalType = type === "warn" ? "info" : type;

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
