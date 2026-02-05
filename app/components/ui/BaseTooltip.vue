<template>
    <div class="relative inline-block" @mouseenter="show" @mouseleave="hide" ref="trigger">
        <slot />
        <Teleport to="body">
            <div v-if="isVisible" ref="tooltip"
                class="fixed px-3 py-2 bg-primary text-background text-[10px] font-bold rounded-xl shadow-2xl border border-white/10 dark:border-black/10 backdrop-blur-xl pointer-events-none transition-opacity duration-200 z-150"
                :class="[isVisible ? 'opacity-100' : 'opacity-0']" :style="tooltipStyle">
                {{ text }}
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted } from 'vue'

defineOptions({
    inheritAttrs: false
})

const props = defineProps({
    text: {
        type: String,
        required: true
    },
    position: {
        type: String,
        default: 'top' // top, bottom, left, right
    }
})

const isVisible = ref(false)
const trigger = ref(null)
const tooltip = ref(null)
const tooltipStyle = reactive({
    top: '0px',
    left: '0px'
})

const show = async () => {
    isVisible.value = true
    await nextTick()
    updatePosition()
}

const hide = () => {
    isVisible.value = false
}

const updatePosition = () => {
    if (!trigger.value || !tooltip.value) return

    const triggerRect = trigger.value.getBoundingClientRect()
    const tooltipRect = tooltip.value.getBoundingClientRect()
    const gap = 8

    let top = 0
    let left = 0

    switch (props.position) {
        case 'top':
            top = triggerRect.top - tooltipRect.height - gap
            left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
            break
        case 'bottom':
            top = triggerRect.bottom + gap
            left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
            break
        case 'left':
            top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
            left = triggerRect.left - tooltipRect.width - gap
            break
        case 'right':
            top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
            left = triggerRect.right + gap
            break
    }

    tooltipStyle.top = `${top}px`
    tooltipStyle.left = `${left}px`
}

onMounted(() => {
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
})

onUnmounted(() => {
    window.removeEventListener('scroll', hide, true)
    window.removeEventListener('resize', hide)
})
</script>
