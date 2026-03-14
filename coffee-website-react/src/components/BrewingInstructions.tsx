import { motion } from 'framer-motion'
import { useState } from 'react'

interface BrewingMethod {
  id: string
  name: string
  icon: string
  coffee: string
  water: string
  temperature: string
  grind: string
  brewTime: string
  steps: string[]
}

const brewingMethods: BrewingMethod[] = [
  {
    id: 'pour-over',
    name: 'Pour Over',
    icon: '☕',
    coffee: '15g',
    water: '250ml',
    temperature: '92–96°C',
    grind: 'Medium-Fine',
    brewTime: '3 min',
    steps: [
      'Rinse the filter with hot water to remove paper taste and preheat the dripper.',
      'Add 15g of medium-fine ground coffee and place on your cup or carafe.',
      'Start with a 30ml bloom pour; wait 30 seconds to let the coffee degas.',
      'Pour the remaining water in steady circles over 2–2.5 minutes. Enjoy immediately.',
    ],
  },
  {
    id: 'french-press',
    name: 'French Press',
    icon: '🫗',
    coffee: '18g',
    water: '300ml',
    temperature: '95°C',
    grind: 'Coarse',
    brewTime: '4 min',
    steps: [
      'Preheat the French press with hot water, then discard.',
      'Add 18g of coarsely ground coffee to the press.',
      'Pour 300ml of 95°C water, stir gently, and place the lid on without pressing.',
      'After 4 minutes, press the plunger slowly and pour immediately.',
    ],
  },
  {
    id: 'espresso',
    name: 'Espresso',
    icon: '⚡',
    coffee: '18g',
    water: '36ml output',
    temperature: '93°C',
    grind: 'Fine',
    brewTime: '25–30 sec',
    steps: [
      'Flush your group head and allow the machine to reach 93°C.',
      'Dose 18g of finely ground coffee into the portafilter and distribute evenly.',
      'Tamp with consistent pressure (~15kg) for a level, even puck.',
      'Pull the shot targeting 36ml output in 25–30 seconds. Adjust grind if needed.',
    ],
  },
  {
    id: 'aeropress',
    name: 'AeroPress',
    icon: '🔧',
    coffee: '15g',
    water: '200ml',
    temperature: '85°C',
    grind: 'Medium',
    brewTime: '2 min',
    steps: [
      'Use the inverted method: place the plunger at position 4 and add 15g of medium-ground coffee.',
      'Pour 200ml of 85°C water, stir briefly, and cap with a rinsed filter.',
      'Steep for 1.5 minutes, then carefully flip onto your cup.',
      'Press gently over 30 seconds until you hear a hiss. Dilute to taste if desired.',
    ],
  },
]

export function BrewingInstructions() {
  const [activeTab, setActiveTab] = useState('pour-over')
  const active = brewingMethods.find((m) => m.id === activeTab)!

  return (
    <section className="py-20 bg-surface" id="brewing" aria-label="Brewing instructions">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-background border border-heading/10 rounded-full text-xs font-sans font-medium text-text/70 tracking-wider uppercase mb-6">
            Brew Guide
          </span>
          <h2 className="text-5xl lg:text-6xl font-serif font-semibold text-heading mb-6">
            How to Brew
          </h2>
          <p className="text-lg font-sans text-text/70 leading-relaxed">
            Every method unlocks a different side of this coffee. Choose your preferred brew style
            and follow our step-by-step guide for the perfect cup.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-10"
          role="tablist"
          aria-label="Brewing methods"
        >
          {brewingMethods.map((method) => (
            <motion.button
              key={method.id}
              onClick={() => setActiveTab(method.id)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              role="tab"
              aria-selected={activeTab === method.id}
              aria-controls={`panel-${method.id}`}
              className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 font-sans font-medium text-sm transition-all duration-300 ${
                activeTab === method.id
                  ? 'bg-heading text-background border-heading shadow-md'
                  : 'bg-background text-heading border-heading/15 hover:border-heading/40 hover:shadow-sm'
              }`}
            >
              <span>{method.icon}</span>
              <span>{method.name}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Content Panel */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          id={`panel-${active.id}`}
          role="tabpanel"
          className="bg-background border border-heading/10 rounded-3xl overflow-hidden shadow-sm"
        >
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Stats */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-heading/10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{active.icon}</span>
                <h3 className="text-2xl font-serif font-semibold text-heading">{active.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Coffee', value: active.coffee },
                  { label: 'Water', value: active.water },
                  { label: 'Temperature', value: active.temperature },
                  { label: 'Grind Size', value: active.grind },
                  { label: 'Brew Time', value: active.brewTime },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 bg-surface border border-heading/8 rounded-xl"
                  >
                    <p className="text-xs font-sans text-text/50 uppercase tracking-wider mb-1">
                      {stat.label}
                    </p>
                    <p className="text-sm font-sans font-semibold text-heading">{stat.value}</p>
                  </div>
                ))}
                {/* Accent badge */}
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
                  <span className="text-xs font-sans font-semibold text-accent uppercase tracking-widest">
                    Single Origin
                  </span>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="p-8">
              <h4 className="text-sm font-sans font-medium text-text/50 uppercase tracking-widest mb-6">
                Step-by-Step
              </h4>
              <ol className="space-y-5">
                {active.steps.map((step, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="flex gap-4"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-xs font-bold text-accent">
                      {i + 1}
                    </span>
                    <p className="text-sm font-sans text-text/70 leading-relaxed pt-0.5">{step}</p>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
