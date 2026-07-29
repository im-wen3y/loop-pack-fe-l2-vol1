import boundaries from 'eslint-plugin-boundaries'

const FSD_LAYERS = ['_app', '_pages', 'widgets', 'features', 'entities', 'shared']
const SLICED_LAYERS = ['_pages', 'widgets', 'features', 'entities']

const isSliced = (layer) => SLICED_LAYERS.includes(layer)

const lowerLayersOf = (layer) => FSD_LAYERS.slice(FSD_LAYERS.indexOf(layer) + 1)

const elements = [
  {
    type: 'entity-cross',
    pattern: 'src/entities/*/@x',
    capture: ['owner'],
  },
  ...FSD_LAYERS.map((layer) =>
    isSliced(layer)
      ? { type: layer, pattern: `src/${layer}/*`, capture: ['slice'] }
      : { type: layer, pattern: `src/${layer}` },
  ),
  { type: 'next-app', pattern: 'src/app' },
]

const sameSliceOf = (layer) => ({
  element: {
    type: layer,
    captured: { slice: '{{from.element.captured.slice}}' },
  },
})

const policies = [
  {
    from: { element: { type: 'next-app' } },
    allow: {
      to: FSD_LAYERS.map((layer) => ({ element: { type: layer } })),
    },
  },
  ...FSD_LAYERS.map((layer) => ({
    from: { element: { type: layer } },
    allow: {
      to: [
        ...lowerLayersOf(layer).map((lowerLayer) => ({
          element: { type: lowerLayer },
        })),
        isSliced(layer) ? sameSliceOf(layer) : { element: { type: layer } },
        ...(layer === 'entities' ? [{ element: { type: 'entity-cross' } }] : []),
      ],
    },
  })),
]

const fsdConfig = {
  files: ['src/**/*.{ts,tsx}'],
  plugins: { boundaries },
  settings: {
    'boundaries/include': ['src/{_app,_pages,widgets,features,entities,shared,app}/**/*'],
    'boundaries/elements': elements,
    'import/resolver': {
      typescript: { alwaysTryTypes: true },
    },
  },
  rules: {
    'boundaries/dependencies': ['error', { default: 'disallow', policies }],
    'boundaries/no-unknown-dependencies': 'error',
    'boundaries/no-unknown-files': 'error',
  },
}

export default fsdConfig
