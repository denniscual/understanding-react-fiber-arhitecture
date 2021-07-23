// import { useState } from 'react'
import ThisIsATest from './ThisIsATest'

export default function App({ name }: any) {
  return <ThisIsATest />
}

// export default function App() {
//   const [state1, setState1] = useState('State 1')
//   const [state2, setState2] = useState('State 2')
//   return (
//     <div className="app">
//       <div className="button-container">
//         {state1 === 'State 1' ? (
//           <button
//             id="button"
//             onClick={() => {
//               setState1('This is state 1')
//               setState2(() => {
//                 return 'This is state 2'
//               })
//             }}
//           >
//             {state1}
//             {state2}
//           </button>
//         ) : (
//           <div className="fake-button">
//             {state1}
//             {state2}
//           </div>
//         )}
//       </div>
//       <Test />
//     </div>
//   )
// }

// function Test() {
//   return <div className="test">Test</div>
// }

class FiberNode {
  tag: number = 0
  return: FiberNode | null = null
  child: FiberNode | null = null
  sibling: FiberNode | null = null
  updateQueue: any[] = []
  stateNode: HTMLElement | null = null
  alternate: FiberNode | null = null
  pendingProps: any
  memoizedProps: any
  memoizedState: any
}

const counterElements = createElement(Counter, {
  initValue: 0,
  incrementBy: 10,
})

function render(element: any, counter: HTMLElement) {
  const hostRoot = new FiberNode()
}

function Counter({
  initValue = 0,
  incrementBy = 1,
}: {
  initValue: number
  incrementBy: number
}) {
  let count = initValue
  return createElement('div', {}, [
    createElement('span', {}, count),
    createElement(
      'button',
      {
        onClick() {
          count += incrementBy
        },
      },
      'Increment'
    ),
  ])
}

function createElement(type: any, props: any, children: any = null) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  }
}

// // Create fiber node for every elements and link these nodes including the `parentNode` to each other.
// // This will result to "singly-linkedlist"-based tree. E.g "Parent/return node" => "Child node" => "Sibling node" => "Sibling node". With this technique, we can easily traverse the "tree" in O(n) because the "connection" is linear. And
// // we can traverse the "tree" without using recursion. So the space is O(1).
// function linkNodes(parentNode: FiberNode, elements: TComponent[]) {
//   // If the parentNode doesnt have children, return null.
//   if (elements.length === 0) return null
//   parentNode.child = elements.reduceRight((previous, element) => {
//     const fiberNode = new FiberNode(element)
//     fiberNode.return = parentNode
//     fiberNode.sibling = previous
//     return fiberNode
//   }, null as FiberNode | null)

//   return parentNode.child
// }

interface TComponent {
  name: string
  render(): TComponent[]
}
