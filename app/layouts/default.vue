<template>
  <div class="flex min-h-screen bg-background font-sans overflow-x-hidden">
    <!-- Mobile Backdrop -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 lg:hidden"
        @click="isMobileSidebarOpen = false"
      ></div>
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        isCollapsed ? 'lg:w-20' : 'lg:w-80',
        isMobileSidebarOpen
          ? 'translate-x-0'
          : '-translate-x-full lg:translate-x-0',
      ]"
      class="fixed lg:sticky inset-y-0 left-0 z-70 lg:z-50 w-80 bg-surface lg:m-6 lg:rounded-3xl flex flex-col py-8 shadow-2xl lg:shadow-[0_10px_40px_rgba(0,0,0,0.04)] border-r lg:border border-border lg:top-6 lg:h-[calc(100vh-3rem)] transition-all duration-500 ease-in-out group/sidebar hover:border-brand/20"
    >
      <!-- Mobile Close Button -->
      <button
        @click="isMobileSidebarOpen = false"
        class="lg:hidden absolute top-6 right-6 w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary"
      >
        <X size="20" />
      </button>

      <!-- Collapse Toggle (Desktop only) -->
      <div class="hidden lg:block absolute -right-3.5 top-10 z-60">
        <BaseTooltip
          :text="
            isCollapsed ? 'Expandir Sidebar (⌘B)' : 'Recolher Sidebar (⌘B)'
          "
          position="right"
        >
          <button
            @click="isCollapsed = !isCollapsed"
            class="w-7 h-7 bg-surface border border-border rounded-lg flex items-center justify-center shadow-lg hover:bg-primary/5 hover:border-brand/50 transition-all group/toggle active:scale-95"
          >
            <component
              :is="isCollapsed ? ChevronRight : ChevronLeft"
              size="14"
              class="text-secondary group-hover/toggle:text-brand transition-colors"
            />
          </button>
        </BaseTooltip>
      </div>

      <!-- Logo Section -->
      <div
        class="mb-10 overflow-hidden shrink-0 transition-all duration-500"
        :class="isCollapsed && !isMobileSidebarOpen ? 'px-4' : 'px-6'"
      >
        <div
          class="flex items-center gap-4"
          :class="isCollapsed && !isMobileSidebarOpen ? 'justify-center' : ''"
        >
          <div
            class="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand/20 p-2.5 transition-transform duration-500"
            :class="isCollapsed && !isMobileSidebarOpen ? 'scale-90' : ''"
          >
            <svg
              viewBox="0 0 512 300"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="155" cy="245" r="45" />
              <circle cx="265" cy="245" r="45" />
              <circle cx="435" cy="245" r="45" />
              <path
                d="M40 170h430v60H40zM350 70h80c40 0 45 40 45 40v60H350V70z M440 90h25v45h-25z"
              />
              <path
                d="M60 80l240-50c15-3 30 10 30 25v120c0 15-15 28-30 25L60 150c-15-3-20-15-20-30V110c0-15 5-27 20-30z"
              />
              <path d="M40 70l20 20v60l-20 20z" />
            </svg>
          </div>
          <div
            v-show="!isCollapsed || isMobileSidebarOpen"
            class="whitespace-nowrap transition-all duration-500"
          >
            <h1
              class="text-xl font-black text-primary leading-none tracking-tighter uppercase"
            >
              Meu Concreto
            </h1>
            <p
              class="text-[9px] text-secondary font-bold tracking-[0.2em] mt-1 uppercase opacity-40"
            >
              Intelligence Platform
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 overflow-y-auto no-scrollbar space-y-12 py-2">
        <div
          v-for="(group, gIndex) in navGroups"
          :key="group.title"
          class="space-y-4"
        >
          <div
            v-if="!isCollapsed || isMobileSidebarOpen"
            class="px-5 text-[10px] font-black text-secondary/50 uppercase tracking-[0.25em]"
          >
            {{ group.title }}
          </div>
          <div v-else class="h-px bg-border/50 mx-4 my-6"></div>

          <div class="space-y-1.5">
            <BaseTooltip
              v-for="(item, index) in group.items"
              :key="item.path"
              :text="item.name"
              position="right"
              :disabled="!isCollapsed || isMobileSidebarOpen"
            >
              <NuxtLink
                :to="item.path"
                @click="isMobileSidebarOpen = false"
                class="flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group/nav relative overflow-hidden"
                :class="[
                  isCollapsed && !isMobileSidebarOpen
                    ? 'lg:justify-center lg:px-0 lg:w-12 lg:h-12 mx-auto'
                    : '',
                  $route.path === item.path
                    ? 'bg-brand text-background shadow-[0_15px_30px_-5px_#ff7a3d44]'
                    : 'text-secondary hover:bg-primary/5 hover:text-primary',
                ]"
              >
                <div class="relative z-10 shrink-0">
                  <component
                    :is="item.icon"
                    size="18"
                    :stroke-width="$route.path === item.path ? 3 : 2"
                  />
                </div>
                <span
                  v-if="!isCollapsed || isMobileSidebarOpen"
                  class="relative z-10 text-[13px] font-bold tracking-tight whitespace-nowrap"
                >
                  {{ item.name }}
                </span>

                <!-- Indicator for collapsed active state -->
                <div
                  v-if="
                    isCollapsed &&
                    !isMobileSidebarOpen &&
                    $route.path === item.path
                  "
                  class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand rounded-r-full shadow-[0_0_15px_#ff7a3d]"
                ></div>
              </NuxtLink>
            </BaseTooltip>
          </div>
        </div>
      </nav>

      <!-- Bottom System Controls -->
      <div
        class="mt-auto px-4 pt-4 space-y-4 border-t border-border/50 bg-linear-to-t from-primary/2 to-transparent"
      >
        <div class="space-y-1">
          <!-- Multi-company Switcher -->
          <BaseTooltip
            v-if="user?.acessoEmpresas?.length > 0"
            text="Trocar Unidade de Trabalho"
            position="right"
            :disabled="!isCollapsed || isMobileSidebarOpen"
          >
            <button
              @click="navigateTo('/select-company')"
              class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-secondary hover:bg-primary/5 transition-all group border border-transparent hover:border-border/50"
              :class="[
                isCollapsed && !isMobileSidebarOpen
                  ? 'lg:justify-center lg:px-0 lg:w-12 lg:h-12 mx-auto'
                  : '',
              ]"
            >
              <Building2
                size="18"
                class="shrink-0 group-hover:text-brand transition-colors"
              />
              <div
                v-if="!isCollapsed || isMobileSidebarOpen"
                class="flex flex-col items-start overflow-hidden"
              >
                <span
                  class="text-[9px] font-black uppercase tracking-widest opacity-40 leading-none mb-1"
                  >Unidade Ativa</span
                >
                <span
                  class="text-[11px] font-black whitespace-nowrap truncate text-primary group-hover:text-brand transition-colors uppercase tracking-tight"
                >
                  {{ user.empresa?.empresa || "Selecionar" }}
                  <span
                    v-if="user.empresa?.filial"
                    class="text-[9px] opacity-40 ml-1 font-bold"
                    >- {{ user.empresa?.filial }}</span
                  >
                </span>
              </div>
            </button>
          </BaseTooltip>

          <BaseTooltip
            text="Encerrar Sessão"
            position="right"
            :disabled="!isCollapsed || isMobileSidebarOpen"
          >
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-danger hover:bg-danger/10 transition-all group"
              :class="[
                isCollapsed && !isMobileSidebarOpen
                  ? 'lg:justify-center lg:px-0 lg:w-12 lg:h-12 mx-auto'
                  : '',
              ]"
            >
              <LogOut size="18" class="shrink-0" />
              <span
                v-if="!isCollapsed || isMobileSidebarOpen"
                class="text-xs font-black uppercase tracking-widest text-danger"
                >Encerrar Sessão</span
              >
            </button>
          </BaseTooltip>
        </div>

        <!-- User Profile Component -->
        <BaseTooltip
          v-if="user"
          :text="user.nome"
          position="right"
          :disabled="!isCollapsed || isMobileSidebarOpen"
        >
          <div
            class="p-2.5 bg-primary/3 rounded-2xl flex items-center gap-3 border border-border/40 hover:border-border transition-all cursor-pointer group/profile"
            :class="[
              isCollapsed && !isMobileSidebarOpen
                ? 'lg:justify-center lg:p-1 lg:w-12 lg:h-12 mx-auto'
                : '',
            ]"
          >
            <div
              class="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-background font-black text-xs shrink-0 border-2 border-surface shadow-sm uppercase group-hover/profile:scale-105 transition-transform"
            >
              {{ user.nome.charAt(0) }}
            </div>
            <div
              v-if="!isCollapsed || isMobileSidebarOpen"
              class="overflow-hidden"
            >
              <p
                class="text-[11px] font-black text-primary truncate leading-none uppercase tracking-tight"
              >
                {{ user.nome }}
              </p>
              <p
                class="text-[9px] text-secondary truncate mt-1.5 font-bold uppercase tracking-widest opacity-40"
              >
                {{ user.admin ? "Controlador Master" : "Operador Técnico" }}
              </p>
            </div>
          </div>
        </BaseTooltip>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div
      class="flex-1 flex flex-col overflow-hidden py-0 lg:py-6 pr-0 lg:pr-6 pl-0"
    >
      <!-- Mobile Top Bar -->
      <div
        class="lg:hidden flex items-center justify-between px-6 py-4 bg-surface/80 border-b border-border sticky top-0 z-40 backdrop-blur-xl shrink-0"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white p-2 shadow-lg shadow-brand/20"
          >
            <svg
              viewBox="0 0 512 300"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="155" cy="245" r="45" />
              <circle cx="265" cy="245" r="45" />
              <circle cx="435" cy="245" r="45" />
              <path
                d="M40 170h430v60H40zM350 70h80c40 0 45 40 45 40v60H350V70z M440 90h25v45h-25z"
              />
              <path
                d="M60 80l240-50c15-3 30 10 30 25v120c0 15-15 28-30 25L60 150c-15-3-20-15-20-30V110c0-15 5-27 20-30z"
              />
              <path d="M40 70l20 20v60l-20 20z" />
            </svg>
          </div>
          <div>
            <p
              class="text-sm font-black text-primary tracking-tighter uppercase leading-none"
            >
              Meu Concreto
            </p>
            <p
              class="text-[8px] font-black text-brand uppercase tracking-widest mt-1 opacity-60"
            >
              Intelligence Platform
            </p>
          </div>
        </div>
        <button
          @click="isMobileSidebarOpen = true"
          class="w-12 h-12 flex items-center justify-center text-primary bg-primary/3 rounded-[1.25rem] active:scale-90 transition-all shadow-sm"
        >
          <Menu size="24" stroke-width="2.5" />
        </button>
      </div>

      <div
        class="flex-1 bg-surface lg:rounded-3xl lg:border border-border lg:shadow-[0_20px_60px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden"
      >
        <!-- Modern Header -->
        <header
          class="flex flex-col md:flex-row items-start md:items-center justify-between py-8 lg:py-10 px-6 lg:px-12 gap-6 shrink-0"
        >
          <div>
            <h1
              class="text-3xl lg:text-4xl font-black tracking-tighter text-primary uppercase"
            >
              {{ pageTitle }}
            </h1>
            <div class="flex items-center gap-3 mt-2">
              <div class="px-2.5 py-1 bg-brand/10 rounded-lg">
                <p
                  class="text-[9px] font-black text-brand uppercase tracking-[0.15em]"
                >
                  Meu Concreto v1.0.0
                </p>
              </div>
              <div class="w-1.5 h-1.5 rounded-full bg-primary/10"></div>
              <p class="text-[11px] font-bold text-secondary opacity-60 italic">
                {{ formattedCurrentDate }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4 lg:gap-8 w-full md:w-auto">
            <!-- Search field matching design -->
            <div class="relative group hidden xl:block search-container">
              <Search
                class="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors"
                size="18"
              />
              <input
                ref="searchInput"
                v-model="search"
                placeholder="Busca Rápida..."
                autocomplete="off"
                class="bg-primary/3 border-none rounded-2xl py-3.5 pl-14 pr-16 text-[13px] font-bold placeholder:text-secondary/40 w-80 focus:ring-4 focus:ring-brand/20 transition-all outline-none text-primary"
                @focus="showResults = search.length >= 2"
                @blur="setTimeout(() => (showResults = false), 200)"
              />
              <div
                class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-surface border border-border rounded-lg shadow-sm pointer-events-none"
              >
                <span
                  class="text-[9px] font-black text-secondary uppercase opacity-40 leading-none"
                  >⌘ K</span
                >
              </div>

              <!-- Search Results Dropdown -->
              <div
                v-if="showResults"
                class="absolute top-[calc(100%+1rem)] left-0 right-0 bg-surface rounded-3xl border border-border shadow-2xl p-2 z-50"
              >
                <div
                  class="max-h-80 overflow-y-auto custom-scrollbar space-y-1"
                >
                  <div
                    v-if="searchResults.length === 0 && !isSearching"
                    class="p-8 text-center"
                  >
                    <div
                      class="w-12 h-12 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    >
                      <Search size="20" class="text-secondary opacity-20" />
                    </div>
                    <p
                      class="text-[11px] font-bold text-secondary uppercase tracking-widest"
                    >
                      Nenhum resultado para "{{ search }}"
                    </p>
                    <p
                      class="text-[9px] text-secondary opacity-40 mt-2 uppercase tracking-tight"
                    >
                      Dica: Busque por nomes, placas ou IDs numéricos
                    </p>
                  </div>

                  <button
                    v-for="result in searchResults"
                    :key="result.category + result.id"
                    @click="navigateToResult(result)"
                    class="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/1 transition-all text-left group"
                  >
                    <div
                      class="w-10 h-10 rounded-xl bg-primary/3 flex items-center justify-center text-secondary group-hover:text-brand group-hover:bg-brand/10 transition-colors"
                    >
                      <component :is="iconMap[result.icon] || User" size="18" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <p class="text-[13px] font-bold text-primary truncate">
                          {{ result.title }}
                        </p>
                        <span
                          class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-30"
                          >{{ result.category }}</span
                        >
                      </div>
                      <p
                        class="text-[11px] font-medium text-secondary truncate"
                      >
                        {{ result.subtitle }}
                      </p>
                    </div>
                  </button>
                </div>
                <div
                  v-if="isSearching"
                  class="absolute inset-0 bg-surface/40 backdrop-blur-[1px] flex items-center justify-center rounded-3xl"
                >
                  <div
                    class="w-5 h-5 border-2 border-brand/20 border-t-brand rounded-full animate-spin"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Header Action Icons -->
            <div
              class="flex items-center justify-between md:justify-end gap-2 lg:gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border"
            >
              <div class="flex items-center gap-2">
                <div class="relative notification-container">
                  <button
                    @click="showNotifications = !showNotifications"
                    class="w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-secondary hover:bg-primary/3 hover:text-brand transition-all relative group"
                  >
                    <Bell size="22" stroke-width="2.5" />
                    <ClientOnly>
                      <div
                        v-if="unreadCount > 0"
                        class="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-brand rounded-full border-4 border-surface group-hover:animate-ping"
                      ></div>
                    </ClientOnly>
                  </button>

                  <!-- Painel de Notificações -->
                  <div
                    v-if="showNotifications"
                    class="absolute top-[calc(100%+1rem)] right-0 w-80 bg-surface rounded-3xl border border-border shadow-2xl z-50 overflow-hidden animate-enter"
                  >
                    <div
                      class="p-5 border-b border-border flex justify-between items-center bg-primary/2"
                    >
                      <h3
                        class="text-xs font-black uppercase tracking-widest text-primary"
                      >
                        Notificações
                      </h3>
                      <span
                        v-if="unreadCount > 0"
                        class="px-2 py-0.5 bg-brand text-white text-[9px] font-black rounded-full"
                        >{{ unreadCount }} Novas</span
                      >
                    </div>

                    <div class="max-h-100 overflow-y-auto custom-scrollbar">
                      <div
                        v-if="notifications.length === 0"
                        class="p-10 text-center"
                      >
                        <BellOff
                          size="24"
                          class="text-secondary/20 mx-auto mb-2"
                        />
                        <p
                          class="text-[10px] font-bold text-secondary uppercase tracking-widest"
                        >
                          Tudo limpo por aqui
                        </p>
                      </div>

                      <div
                        v-for="notif in notifications"
                        :key="notif.id"
                        @click="navigateToNotification(notif)"
                        class="p-4 border-b border-border/50 hover:bg-primary/2 transition-colors cursor-pointer group"
                      >
                        <div class="flex gap-4">
                          <div
                            :class="[
                              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                              notif.type === 'ERROR'
                                ? 'bg-rose-500/10 text-rose-500'
                                : notif.type === 'WARN'
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-blue-500/10 text-blue-500',
                            ]"
                          >
                            <component
                              :is="iconMap[notif.icon] || Bell"
                              size="18"
                            />
                          </div>
                          <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start mb-1">
                              <p
                                class="text-[11px] font-black text-primary uppercase tracking-tight truncate"
                              >
                                {{ notif.title }}
                              </p>
                              <span
                                class="text-[9px] font-bold text-secondary opacity-40"
                                >{{ formatTime(notif.time) }}</span
                              >
                            </div>
                            <p
                              class="text-[12px] text-secondary leading-snug mb-2 lowercase first-letter:uppercase"
                            >
                              {{ notif.message }}
                            </p>
                            <div class="flex items-center gap-2">
                              <span
                                class="text-[9px] font-black text-brand uppercase px-1.5 py-0.5 bg-brand/5 rounded-md"
                                >{{ notif.empresa }}</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <NuxtLink
                      to="/logs"
                      @click="showNotifications = false"
                      class="block w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-brand bg-primary/2 hover:bg-primary/3 transition-all"
                    >
                      Ver Todos os Logs
                    </NuxtLink>
                  </div>
                </div>

                <button
                  @click="toggleTheme"
                  class="w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-secondary hover:bg-primary/3 hover:text-brand transition-all"
                >
                  <Sun
                    v-if="colorMode.preference === 'dark'"
                    size="22"
                    stroke-width="2.5"
                  />
                  <Moon v-else size="22" stroke-width="2.5" />
                </button>
              </div>

              <button
                @click="handleExport"
                :disabled="isExporting"
                class="flex-1 md:flex-none justify-center bg-brand text-background px-6 lg:px-8 py-3.5 rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-2x shadow-brand/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:scale-100"
              >
                <Download v-if="!isExporting" size="18" stroke-width="3" />
                <RefreshCw v-else size="18" class="animate-spin" />
                {{ isExporting ? "Gerar" : "Export" }}
              </button>
            </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <main
          class="flex-1 overflow-y-auto px-6 lg:px-10 pb-6 lg:pb-10 custom-scrollbar"
        >
          <slot />
        </main>
      </div>
    </div>

    <!-- Modal de Troca de Senha Obrigatória -->
    <ClientOnly>
      <ModalChangePassword
        v-if="showChangePassword"
        :user-id="user?.id"
        @success="onPasswordChanged"
      />
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import {
  useColorMode,
  useCookie,
  navigateTo,
  useFetch,
  useRoute,
} from "#imports";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Users,
  Package,
  Sun,
  Moon,
  UserCog,
  UserCheck,
  CreditCard,
  FileStack,
  History,
  FileText,
  User,
  Calendar,
  Download,
  RefreshCw,
  DollarSign,
  Building2,
  MessageSquare,
  Truck,
  Activity,
  BellOff,
  BarChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  FlaskConical,
  Layers,
  Landmark,
  QrCode,
  Cloud,
  Sparkles,
  Menu,
  X,
} from "lucide-vue-next";

const search = ref("");
const searchResults = ref([]);
const isSearching = ref(false);
const showResults = ref(false);
const showNotifications = ref(false);
const searchInput = ref(null);
const isCollapsed = ref(true);
const isMobileSidebarOpen = ref(false);
const colorMode = useColorMode();
const { user, logout, fetchUser } = useAuth();
const { add: addToast } = useToast();
const route = useRoute();

const formattedCurrentDate = useState("current_header_date", () => {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const isExporting = ref(false);
const showChangePassword = ref(false);

// Monitorar necessidade de troca de senha
watch(
  () => user.value?.passwordChangeRequired,
  (newValue) => {
    if (newValue === 1) {
      showChangePassword.value = true;
    } else {
      showChangePassword.value = false;
    }
  },
  { immediate: true },
);

const onPasswordChanged = async () => {
  showChangePassword.value = false;
  await fetchUser(); // Atualiza o estado global do usuário
};

// Lógica de Notificações
const { data: notificationsData, refresh: refreshNotifications } = useFetch(
  "/api/notificacoes",
  {
    immediate: true,
    enabled: computed(() => user.value?.admin === 1),
  },
);

const notifications = computed(() => notificationsData.value || []);
const unreadCount = computed(() => notifications.value.length);

const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000 / 60); // em minutos

  if (diff < 1) return "Agora";
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

// Fechar notificações ao clicar fora
if (import.meta.client) {
  window.addEventListener("click", (e) => {
    if (!e.target.closest(".notification-container")) {
      showNotifications.value = false;
    }
  });
}

// Polling suave para notificações (30s)
let notificationInterval;
onMounted(() => {
  if (user.value?.admin === 1) {
    notificationInterval = setInterval(refreshNotifications, 30000);
  }
});

onUnmounted(() => {
  if (notificationInterval) clearInterval(notificationInterval);
});

const handleExport = async () => {
  isExporting.value = true;

  // Lógica inteligente: Identifica o contexto baseado na rota
  const pageName =
    route.meta.name || route.path.split("/").pop() || "Dashboard";
  const context = route.path.includes("vendas")
    ? "Vendas"
    : route.path.includes("orcamentos")
      ? "Orçamentos"
      : route.path.includes("pagamentos")
        ? "Financeiro"
        : route.path.includes("clientes")
          ? "Clientes"
          : "Relatório";

  try {
    // Simula processamento de exportação conforme o contexto
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mudança para CSV: Mais inteligente para análise de dados e evita erro de PDF corrompido
    const fileName = `${context}_${new Date().toISOString().split("T")[0]}.csv`;

    // Conteúdo formatado em CSV (pode ser expandido para pegar dados reais da tela)
    const csvHeader = "ID;Data;Contexto;Descrição;Status\n";
    const csvRow = `001;${new Date().toLocaleDateString("pt-BR")};${context};Relatório gerado via Intelligence Platform;Concluído`;
    const blob = new Blob(["\uFEFF" + csvHeader + csvRow], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);

    addToast(
      {
        title: "Exportação Concluída",
        description: `O arquivo ${fileName} foi gerado para análise no Excel.`,
      },
      "success",
    );
  } catch (error) {
    addToast(
      {
        title: "Erro na Exportação",
        description: "Não foi possível gerar o arquivo. Tente novamente.",
      },
      "error",
    );
  } finally {
    isExporting.value = false;
  }
};

const iconMap = {
  Users: Users,
  FileStack: FileStack,
  Package: Package,
  UserCheck: UserCheck,
  AlertTriangle: AlertTriangle,
  Info: Info,
  ShoppingBag: ShoppingBag,
  Truck: Truck,
  Activity: Activity,
  Building2: Building2,
};

// Global Search Keyboard Shortcut (⌘K / Ctrl+K)
const handleKeyDown = (e) => {
  // Toggle Sidebar (⌘B)
  if ((e.metaKey || e.ctrlKey) && e.key === "b") {
    e.preventDefault();
    isCollapsed.value = !isCollapsed.value;
  }

  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    searchInput.value?.focus();
  }
  if (e.key === "Escape") {
    showResults.value = false;
    searchInput.value?.blur();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      showResults.value = false;
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

const performSearch = async (query) => {
  if (query.length < 2) {
    searchResults.value = [];
    showResults.value = false;
    return;
  }

  isSearching.value = true;
  showResults.value = true;
  try {
    const data = await $fetch("/api/search", {
      query: { q: query },
    });
    searchResults.value = data?.results || [];
  } catch (error) {
    console.error("Search error:", error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

let debounceTimeout;
watch(search, (newVal) => {
  clearTimeout(debounceTimeout);
  if (!newVal) {
    searchResults.value = [];
    showResults.value = false;
    return;
  }
  debounceTimeout = setTimeout(() => {
    performSearch(newVal);
  }, 300);
});

const navigateToResult = (result) => {
  search.value = "";
  showResults.value = false;
  navigateTo(result.path);
};

const navigateToNotification = (notif) => {
  showNotifications.value = false;
  if (notif.id.startsWith("orc-")) {
    const id = notif.id.split("-")[1];
    navigateTo(`/orcamentos?id=${id}`);
  } else {
    navigateTo("/logs");
  }
};

const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

const pageTitle = computed(() => {
  // Check in navGroups
  for (const group of navGroups.value) {
    const item = group.items.find((i) => i.path === route.path);
    if (item) return item.name;
  }

  // Specific fallback for sub-pages or dynamic routes
  if (route.path.startsWith("/entregas/")) return "Detalhes da Entrega";
  if (route.path.startsWith("/financeiro/fornecedores")) return "Fornecedores";
  if (route.path.startsWith("/financeiro/contas-pagar"))
    return "Contas a Pagar";

  return "Painel de Controle";
});

const navGroups = computed(() => {
  const isAdmin = user.value?.admin === 1;

  const groups = [
    {
      title: "Inteligência de Gestão",
      items: [
        { name: "Dashboard Principal", path: "/", icon: LayoutDashboard },
      ],
    },
    {
      title: "Comercial & CRM",
      items: [
        { name: "Carteira de Clientes", path: "/clientes", icon: Users },
        { name: "Equipe de Vendedores", path: "/vendedores", icon: UserCheck },
        { name: "Orçamentos", path: "/orcamentos", icon: FileStack },
        { name: "Vendas Realizadas", path: "/vendas", icon: ShoppingBag },
      ],
    },
    {
      title: "Produção & Engenharia",
      items: [
        { name: "Gestão de Insumos", path: "/insumos", icon: Package },
        { name: "Dosagem (Mix Design)", path: "/tracos", icon: FlaskConical },
        { name: "Tabela de Produtos", path: "/produtos", icon: Layers },
      ],
    },
    {
      title: "Logística & Frota",
      items: [
        { name: "Agenda de Entregas", path: "/agenda", icon: Calendar },
        { name: "Agenda de Bombas", path: "/bombas/agenda", icon: Activity },
        { name: "Controle de Frota", path: "/caminhoes", icon: Truck },
        { name: "Bombas de Concreto", path: "/bombas", icon: Activity },
        { name: "Cadastro Motoristas", path: "/motoristas", icon: UserCheck },
      ],
    },
    {
      title: "Financeiro & Fiscal",
      items: [
        { name: "Painel Financeiro", path: "/financeiro", icon: BarChart },
        { name: "Contas a Receber", path: "/pagamentos", icon: TrendingUp },
        {
          name: "Contas a Pagar",
          path: "/financeiro/contas-pagar",
          icon: TrendingDown,
        },
        {
          name: "Inadimplência",
          path: "/financeiro/inadimplencia",
          icon: AlertTriangle,
        },
        {
          name: "Fornecedores",
          path: "/financeiro/fornecedores",
          icon: Building2,
        },
        { name: "Formas de Pagamento", path: "/forma-pgto", icon: DollarSign },
      ],
    },
  ];

  // Modificações específicas para Administradores
  if (isAdmin) {
    // Adicionar itens administrativos na Inteligência de Gestão
    const gestaoGroup = groups.find((g) => g.title === "Inteligência de Gestão");
    if (gestaoGroup) {
      gestaoGroup.items.push({
        name: "Análise & Insights",
        path: "/gestao",
        icon: Activity,
      });
      gestaoGroup.items.push({
        name: "Fiscal AI Pulse",
        path: "/configuracoes/fiscal-ai",
        icon: Sparkles,
      });
    }

    // Adicionar Centro Fiscal no Financeiro
    const financeiroGroup = groups.find((g) => g.title === "Financeiro & Fiscal");
    if (financeiroGroup) {
      financeiroGroup.items.push({
        name: "Centro Fiscal",
        path: "/configuracoes/fiscal",
        icon: FileText,
      });
    }

    // Adicionar Grupo de Integrações
    groups.push({
      title: "Integrações",
      items: [
        {
          name: "Módulo WhatsApp",
          path: "/configuracoes/whatsapp",
          icon: MessageSquare,
        },
        { name: "Módulo Bling", path: "/configuracoes/bling", icon: Package },
        {
          name: "Gateway Asaas",
          path: "/configuracoes/asaas",
          icon: CreditCard,
        },
        {
          name: "Gateway Sicoob",
          path: "/configuracoes/sicoob",
          icon: Landmark,
        },
        {
          name: "Pix Manual",
          path: "/configuracoes/pix-manual",
          icon: QrCode,
        },
      ],
    });

    // Adicionar Grupo de Configurações
    groups.push({
      title: "Configurações",
      items: [
        {
          name: "Dados da Empresa",
          path: "/configuracoes/empresa",
          icon: Building2,
        },
        {
          name: "Usuários do Sistema",
          path: "/usuarios",
          icon: UserCog,
        },
        {
          name: "Gestão de Filiais",
          path: "/empresas",
          icon: Building2,
        },
        {
          name: "Parâmetros Globais",
          path: "/configuracoes/sistema",
          icon: Settings,
        },
        { name: "Logs do Sistema", path: "/logs", icon: History },
      ],
    });
  }

  return groups;
});

const handleLogout = async () => {
  await logout();
};
</script>
