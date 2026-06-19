<script>
import { laadAllePokemon, laadPagina } from './Services/pokedexService.js'

export default {
  data() {
    return {
      geselecteerdePokemon: null,
      zoekterm: '',
      zoekTimer: null,
      alleNamen: [],
      huidigePagina: [],
      paginaNummer: 0,
      laden: false,
      favorieten: JSON.parse(localStorage.getItem('favorieten') || '[]'),
      drawerOpen: false,
      favoritenPagina: false,
    }
  },

  computed: {
    gefilterdeLijst() {
      if (!this.zoekterm) return this.alleNamen
      return this.alleNamen.filter(p =>
        p.naam.toLowerCase().includes(this.zoekterm.toLowerCase())
      )
    },
    totaalPaginas() {
      return Math.ceil(this.gefilterdeLijst.length / 12)
    },
    typeKleur() {
      return (type) => {
        const kleuren = {
          fire: '#FF6B35', water: '#4FC3F7', grass: '#66BB6A',
          electric: '#FFCA28', psychic: '#EC407A', ice: '#80DEEA',
          dragon: '#7E57C2', dark: '#5D4037', fairy: '#F48FB1',
          normal: '#BDBDBD', fighting: '#EF5350', flying: '#90CAF9',
          poison: '#AB47BC', ground: '#BCAAA4', rock: '#8D6E63',
          bug: '#9CCC65', ghost: '#5C6BC0', steel: '#78909C',
        }
        return kleuren[type] || '#BDBDBD'
      }
    }
  },

  watch: {
    zoekterm() {
      clearTimeout(this.zoekTimer)
      this.zoekTimer = setTimeout(() => {
        this.paginaNummer = 0
        this.verversPagina()
      }, 400)
    }
  },

  methods: {
    async allesLaden() {
      this.laden = true
      this.alleNamen = await laadAllePokemon()
      await this.verversPagina()
      this.laden = false
    },

    async verversPagina() {
      this.laden = true
      this.huidigePagina = await laadPagina(this.gefilterdeLijst, this.paginaNummer)
      this.laden = false
    },

    vorigePagina() {
      if (this.paginaNummer > 0) {
        this.paginaNummer--
        this.verversPagina()
      }
    },

    volgendePagina() {
      if (this.paginaNummer < this.totaalPaginas - 1) {
        this.paginaNummer++
        this.verversPagina()
      }
    },

    hoofdTypeKleur(pokemon) {
      const type = pokemon.types[0]?.type.name
      return this.typeKleur(type)
    },

    toggleFavoriet(pokemon) {
      const index = this.favorieten.findIndex(f => f.id === pokemon.id)
      if (index === -1) {
        this.favorieten.push({ id: pokemon.id, name: pokemon.name, sprite: pokemon.sprites.front_default })
      } else {
        this.favorieten.splice(index, 1)
      }
      localStorage.setItem('favorieten', JSON.stringify(this.favorieten))
    },

    isFavoriet(pokemon) {
      return this.favorieten.some(f => f.id === pokemon.id)
    },
    verwijderFavoriet(f) {
      this.favorieten = this.favorieten.filter(fav => fav.id !== f.id)
      localStorage.setItem('favorieten', JSON.stringify(this.favorieten))
    },
  },

  mounted() {
    this.allesLaden()
  }
}
</script>

<template>
  <v-app>
    <!-- Sidebar -->
    <v-navigation-drawer v-model="drawerOpen" temporary>
      <v-list>
        <v-list-item prepend-icon="mdi-view-grid" title="Pokémon"
          @click="favoritenPagina = false; drawerOpen = false" />
        <v-list-item prepend-icon="mdi-star" title="Favorieten" @click="favoritenPagina = true; drawerOpen = false" />
      </v-list>
    </v-navigation-drawer>

    <!-- Topbalk -->
    <v-app-bar color="red-darken-4" elevation="4">
      <v-btn icon variant="text" @click="drawerOpen = !drawerOpen">
        <v-icon color="white">mdi-pokeball</v-icon>
      </v-btn>
      <v-app-bar-title class="font-weight-bold text-white" style="cursor: pointer" @click="zoekterm = ''">
        Pokédex
      </v-app-bar-title>
      <v-text-field v-model="zoekterm" placeholder="Zoeken..." hide-details density="compact" variant="solo" rounded
        class="mr-3" style="max-width: 180px" prepend-inner-icon="mdi-magnify" />
    </v-app-bar>

    <!-- Laadindicator -->
    <v-progress-linear v-if="laden" indeterminate color="red-darken-4" />

    <!-- Hoofdinhoud -->
    <v-main style="background: #1a1a2e;">
      <v-container class="py-4">

        <!-- Pokémon grid -->
        <template v-if="!favoritenPagina">
          <v-row dense>
            <v-col v-for="pokemon in huidigePagina" :key="pokemon.id" cols="6">
              <v-card @click="geselecteerdePokemon = pokemon" rounded="xl" elevation="4" class="pokemon-card"
                :style="{ background: `linear-gradient(135deg, ${hoofdTypeKleur(pokemon)}33, #1e1e3a)` }">
                <v-img :src="pokemon.sprites.front_default" height="100" contain class="mt-2" />
                <v-card-text class="pa-2 pt-0">
                  <div class="text-caption text-grey">#{{ String(pokemon.id).padStart(3, '0') }}</div>
                  <div class="d-flex justify-space-between align-center">
                    <div class="text-body-2 font-weight-bold text-white text-capitalize">{{ pokemon.name }}</div>
                    <v-btn icon size="x-small" variant="text" @click.stop="toggleFavoriet(pokemon)">
                      <v-icon :color="isFavoriet(pokemon) ? 'yellow' : 'grey'">
                        {{ isFavoriet(pokemon) ? 'mdi-star' : 'mdi-star-outline' }}
                      </v-icon>
                    </v-btn>
                  </div>
                  <div class="d-flex gap-1 flex-wrap mt-1">
                    <v-chip v-for="t in pokemon.types" :key="t.type.name" size="x-small"
                      :style="{ background: typeKleur(t.type.name), color: '#fff' }" class="text-capitalize">
                      {{ t.type.name }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Paginering -->
          <v-row justify="center" class="mt-6 mb-2">
            <v-btn @click="vorigePagina" :disabled="paginaNummer === 0" color="red-darken-4" variant="tonal" rounded
              icon>
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span class="mx-4 align-self-center text-white font-weight-bold">
              {{ paginaNummer + 1 }} / {{ totaalPaginas }}
            </span>
            <v-btn @click="volgendePagina" :disabled="paginaNummer >= totaalPaginas - 1" color="red-darken-4"
              variant="tonal" rounded icon>
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-row>
        </template>

        <!-- Favorieten -->
        <template v-else>
          <div class="text-white text-h6 mb-4">Favorieten</div>
          <v-row dense>
            <v-col v-for="f in favorieten" :key="f.id" cols="6">
              <v-card rounded="xl" elevation="4" color="#16213e">
                <v-img :src="f.sprite" height="100" contain class="mt-2" />
                <v-card-text class="pa-2">
                  <div class="d-flex justify-space-between align-center">
                    <div class="text-body-2 font-weight-bold text-white text-capitalize">{{ f.name }}</div>
                    <v-btn icon size="x-small" variant="text" @click="verwijderFavoriet(f)">
                      <v-icon color="yellow">mdi-star</v-icon>
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>

      </v-container>
    </v-main>

    <!-- Detail dialog -->
    <v-dialog v-model="geselecteerdePokemon" fullscreen transition="dialog-bottom-transition">
      <v-card v-if="geselecteerdePokemon" style="background: #1a1a2e;">
        <div class="detail-header pa-4 d-flex align-center"
          :style="{ background: `linear-gradient(135deg, ${hoofdTypeKleur(geselecteerdePokemon)}, #1a1a2e)` }">
          <v-btn icon variant="text" @click="geselecteerdePokemon = null" class="mr-2">
            <v-icon color="white">mdi-arrow-left</v-icon>
          </v-btn>
          <div>
            <div class="text-caption text-white opacity-70">#{{ String(geselecteerdePokemon.id).padStart(3, '0') }}
            </div>
            <div class="text-h5 font-weight-bold text-white text-capitalize">{{ geselecteerdePokemon.name }}</div>
          </div>
          <v-spacer />
          <v-chip v-for="t in geselecteerdePokemon.types" :key="t.type.name"
            :style="{ background: typeKleur(t.type.name) }" class="ml-1 text-white text-capitalize" size="small">
            {{ t.type.name }}
          </v-chip>
        </div>

        <v-img :src="geselecteerdePokemon.sprites.front_default" height="180" contain class="my-2" />

        <v-card-text class="px-4">
          <v-row class="mb-4" dense>
            <v-col cols="6">
              <v-card rounded="xl" color="#16213e" class="pa-3 text-center">
                <div class="text-caption text-grey">Height</div>
                <div class="text-body-1 font-weight-bold text-white">{{ geselecteerdePokemon.height / 10 }} m</div>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card rounded="xl" color="#16213e" class="pa-3 text-center">
                <div class="text-caption text-grey">Weight</div>
                <div class="text-body-1 font-weight-bold text-white">{{ geselecteerdePokemon.weight / 10 }} kg</div>
              </v-card>
            </v-col>
          </v-row>

          <div class="text-subtitle-2 text-grey mb-2">Abilities</div>
          <div class="d-flex flex-wrap gap-2 mb-4">
            <v-chip v-for="a in geselecteerdePokemon.abilities" :key="a.ability.name" variant="tonal"
              color="red-darken-4" class="text-capitalize">
              {{ a.ability.name }}
            </v-chip>
          </div>

          <div class="text-subtitle-2 text-grey mb-2">Base Stats</div>
          <div v-for="s in geselecteerdePokemon.stats" :key="s.stat.name" class="mb-3">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-caption text-grey text-uppercase">{{ s.stat.name }}</span>
              <span class="text-caption font-weight-bold text-white">{{ s.base_stat }}</span>
            </div>
            <v-progress-linear :model-value="s.base_stat" :max="255" rounded height="6"
              :color="hoofdTypeKleur(geselecteerdePokemon)" bg-color="#16213e" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<style scoped>
.pokemon-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.pokemon-card:hover {
  transform: scale(1.03);
}

.detail-header {
  min-height: 100px;
}
</style>