import { render, jsx } from './reconciler-and-renderer'

render(jsx(App), document.getElementById('test') as HTMLElement)

export default function App() {
  return jsx(Test)
}

function Test() {
  return jsx(
    'div',
    {},
    jsx(
      'span',
      {
        style: {
          color: 'red',
        },
        onClick() {
          console.log('Im a span')
        },
      },
      'Click me'
    )
  )
}
