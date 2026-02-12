<template>
    <Teleport to="body">
        <div class="fixed top-8 right-8 flex flex-col gap-3 pointer-events-none" style="z-index: 150;">
            <TransitionGroup enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 translate-x-20 scale-95"
                enter-to-class="opacity-100 translate-x-0 scale-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 translate-x-0 scale-100"
                leave-to-class="opacity-0 translate-x-10 scale-95">
                <div v-for="toast in toasts" :key="toast.id"
                    class="pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl border min-w-[20rem] backdrop-blur-xl transition-all"
                    :class="[
                        toast.type === 'success' ? 'bg-success text-white border-success' :
                            toast.type === 'error' ? 'bg-danger text-white border-danger' :
                                toast.type === 'warn' ? 'bg-warning text-white border-warning' :
                                    'bg-surface text-primary border-border'
                    ]">
                    <div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" :class="[
                        toast.type === 'success' || toast.type === 'error' || toast.type === 'warn' ? 'bg-white/20' :
                                'bg-brand/10 text-brand'
                    ]">
                        <CheckCircle2 v-if="toast.type === 'success'" size="20" />
                        <AlertTriangle v-else-if="toast.type === 'error' || toast.type === 'warn'" size="20" />
                        <Info v-else size="20" />
                    </div>
                    <div class="flex-1">
                        <p class="text-[11px] font-bold uppercase tracking-[0.15em] opacity-60 mb-0.5">{{ toast.type ||
                            'INFO' }}</p>
                        <p class="text-sm font-bold leading-tight">{{ toast.message }}</p>
                    </div>
                    <button @click="remove(toast.id)" class="opacity-40 hover:opacity-100 transition-opacity p-2 -mr-2">
                        <X size="18" />
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup>
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'

const { toasts, remove } = useToast()
</script>
