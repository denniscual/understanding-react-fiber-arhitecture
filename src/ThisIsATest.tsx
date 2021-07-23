export default function ThisIsATest() {
  return (
    <div>
      <span>Hello world</span>
    </div>
  )
}

// TODO:
// - Review this begin work.
// - Do the completeUnitOfWork and completeWork.
// - Do the commit phase.

// Fiber architecture.
// So basically it starts in the creation of the fiber root object which is based on the "passed" container
// in ReactDOM. This root object handles the "Fiber" tree. Then it creates a root fiber node where the state
// node is pointing back to the fiber root object.
//
// There are 2 phases.
// - Render phase
// - Commit phase
//
// In the begin work, it updates the element. But im thinking this updates are wrapped to a update function
// which will run in the "commit phase".
//
// And then in the complete work work, this is the place where React append the DOM nodes. First it creates the DOM node for every child. Then creates the parent and append the children to this parent DOM node based on the `workInProgress` children.
// It uses the same traversal for appending children dom nodes to the parent. Its the "Singly linked-list" traversal.
//
// In commit phase, especially commitMutationEffects, the appending of the App DOM tree is happening in here.
// So React will append the App DOM tree to the root container which "schedules" a "yield".

// First create fiber root object and create fiber node on top of this.
// Then this fiber node will be `current` of the fiber root ojbect.
// Then create a work in progress node based on current. Just copy the `current` but we need to make sure
// these 2 fiber nodes are referential different. When creating a current/work in progress for host root,
// the fiber node has `updateQueue` which holds the app root react element (E.g the app).
// Simple representation of the work in progress node of the host root.
// It has `updateQueue` which holds the Root react element (App) on its baseState field.
// Then create a fiber node based on the App react element. Set the `return` field to the host root.
// And for host root, set its child field to the APp fiber node. Then this `child` is the returned fiber node
// of the beginWork for the hostRoot.
// Then continue the same algorithm for App and so on and so forth.
//
//
// In completeWork, this is the function in render phase where React appends the children to its parent if the
// the workInProgress fiber node is a HOST_COMPONENT. Check createInstance function. If not, then completeWork immediately returns null. Basically what i know is that
// in completeWork, React also add the effectTag of the fiber node based on the changes.
//
// NOTE: For function component, we don't need to assign a stateNode.

type TElementType = any
interface TElement {
  type: TElementType
  props: any
  key: any
}
interface TReactComponent {
  (...args: any[]): JSX.Element
}

enum TFiberNodeTags {
  NONE = 0,
  HOST_ROOT = 1,
  HOST_COMPONENT = 2,
  FUNCTION_COMPONENT = 3,
}

class FiberNode {
  type: TElementType
  tag: TFiberNodeTags = 0
  return: MaybeFiberNode = null
  child: MaybeFiberNode = null
  sibling: MaybeFiberNode = null
  updateQueue: {} | null = null
  stateNode: any = null
  alternate: MaybeFiberNode = null
  pendingProps: any = null
  memoizedProps: any = null
  memoizedState: any
  key: any = undefined

  constructor(type: TElementType, props: any, key: any) {
    this.type = type
    this.pendingProps = props
    this.key = key
  }
}

type MaybeFiberNode = FiberNode | null

class FiberRootObject {
  finishedWork: MaybeFiberNode = null
  current: MaybeFiberNode = null
}

let fiberRootObject: FiberRootObject | null = null

function workLoopSync(unitOfWork: FiberNode) {
  let workInProgress: MaybeFiberNode = unitOfWork
  while (workInProgress !== null) {
    // Start of the "render phase".
    workInProgress = performUnitOfWork(workInProgress)
  }

  // Star of the "commit phase".
}

function performUnitOfWork(unitOfWork: FiberNode): MaybeFiberNode {
  const current = unitOfWork.alternate
  let nextUnitOfWork: MaybeFiberNode = beginWork(current, unitOfWork)

  // Assign the new props of the unitOfWork to its memoizedProps if all `beginWork` works are done.
  // This new props will be the props of the fiber node to the next current state of the app.
  unitOfWork.memoizedProps = unitOfWork.pendingProps

  if (nextUnitOfWork === null) {
    // Call the completeUnitOfWork
  }

  return nextUnitOfWork
}

function beginWork(current: MaybeFiberNode, workInProgress: FiberNode) {
  //if (current !== null) {
  //  // This `workInProgress` is already included in the current state of the App.
  //  // So basically this is an "Update/Re-render".
  //  //
  //  // Basically, when React creates the `workInProgress` and before React goes to this `beginWork` function,
  //  // the `workInProgress` pendingProps is already updated.
  //  //
  //  // E.g
  //  // App has Text component which is relying to the `count` state of the App. App passed it via `props`.
  //  // And App schedules an `update` to this `count` state. Expected behaviour is that App will pass
  //  // the updated `count` state to the `Text`.
  //  //
  //  // So in the `beginWork`, React will compute the new state of the `count` before it creates the new child of the App
  //  // based on the `workInProgress.child.alternate` and also the new state. This new updated child of the App will
  //  // have the `pendingProps` and will point to the new state.
  //  // Then beginWork returns the new updated child of the App and will be assigned as the new `nextUnitOfWork`.
  //  // So it means that if the `workInProgress` is the updated child of the App, then the `workInProgress.pendingProps`
  //  // is already updated. It is updated in the time App was passed in this function.
  //  // Basically the `props` is computed via invoking the Component's render method or calling the function component.
  //  // @ts-ignore
  //  const oldProps = current.memoizedProps
  //  const newProps = workInProgress.pendingProps

  //  if (oldProps !== newProps) {
  //    // Do diff in here. I think so!
  //  }
  //}

  const { tag } = workInProgress

  switch (tag) {
    case TFiberNodeTags.HOST_ROOT: {
      if (!current)
        throw new Error(
          'If the current host root fiber node is "null", then this is likely bug in React.'
        )

      // Map the Root react element, e.g the App, to fiber node and return it.
      return updateHostRoot(current, workInProgress)
    }
    case TFiberNodeTags.HOST_COMPONENT: {
      // Map its react children to fiber nodes and return its first child
      // The generated fiber nodes are based on the React children. Means it will copy the information from the react elements to create fiber nods like "props".
      // So the meaning of "reconcile" in here is to create or clone a fiber nodes based on the React elements and if there is - to its current fiber nodes (workInProgress.alternate).
      return updateHostComponent(current, workInProgress)
    }
    default: {
      // Map its react children to fiber nodes and return its first child
      // The generated fiber nodes are based on the React children. Means it will copy the information from the react elements to create fiber nods like "props".
      // So the meaning of "reconcile" in here is to create or clone a fiber nodes based on the React elements and if there is - to its current fiber nodes (workInProgress.alternate).
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type
      )
    }
  }
}

// It is named "updateHostRoot" because this function updates its fiber node via the `workInProgress`. All changes must
// be written in `workInProgress` btw because its the draft state. Sample of the "updates" are setting its child fiber node and add "effect" tag.
function updateHostRoot(current: FiberNode, workInProgress: FiberNode) {
  workInProgress.memoizedState = {
    // @ts-ignore
    element: workInProgress.updateQueue.baseState,
  }
  const nextState = workInProgress.memoizedState
  const nextChildren = nextState.element
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}

// It is named "updateHostComponent" because this function updates its fiber node via the `workInProgress`. All changes must
// be written in `workInProgress` btw because its the draft state. Sample of the "updates" are setting its child fiber node and add "effect" tag.
function updateHostComponent(
  current: MaybeFiberNode,
  workInProgress: FiberNode
) {
  const nextProps = workInProgress.pendingProps
  let nextChildren = nextProps.children
  const isDirectTextChild = shouldSetTextContent(workInProgress.type, nextProps)
  if (isDirectTextChild) {
    // We special case a direct text child of a host node. This is a common
    // case. We won't handle it as a reified child. We will instead handle
    // this in the host environment that also has access to this prop. That
    // avoids allocating another HostText fiber and traversing it.
    nextChildren = null
  }
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}

function shouldSetTextContent(type: any, props: any) {
  return typeof props.children === 'string'
}

function mountIndeterminateComponent(
  current: MaybeFiberNode,
  workInProgress: FiberNode,
  Component: TReactComponent
) {
  const children = Component(workInProgress.pendingProps)
  reconcileChildren(null, workInProgress, children)
  return workInProgress.child
}

function reconcileChildren(
  current: MaybeFiberNode,
  workInProgress: FiberNode,
  nextChildren: TElement
) {
  // In the react-reconciler, there 2 different child reconcilers, the same logic but one will track if there side-effects, which are ran in here. One is reconciler for update
  // which "tracks" side-effects. E.g if there are scheduled mutation to the host component.
  // Another child reconciler will not track the side-effects. This will happen if the `workInProgress` is a fresh fiber node. Meaning that it is not yet rendered on the screen.
  // If this is a fresh new component that hasn't been rendered yet.
  // if (current === null) {
  //   workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  // } else {
  //   workInProgress.child = reconcileChildFibers(
  //     workInProgress,
  //     current.child,
  //     nextChildren
  //   )
  // }

  // In our mock, we will just run the `mountChildFibers` for now because our codes will not support the "updates".
  workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
}

function mountChildFibers(
  returnFiber: FiberNode,
  currentFirstChild: MaybeFiberNode,
  newChild: TElement
) {
  // If it is a React element.
  if (typeof newChild === 'object' && newChild !== null) {
    return reconcileSingleElement(returnFiber, currentFirstChild, newChild)
  } else if (Array.isArray(newChild)) {
    return null
    // return reconcileChildrenArray(returnFiber, currentFirstChild, newChild)
  } else {
    // newChild is a direct text child of a Host node. For this text child, we don't need to create a fier node.
    return null
  }
}

// function reconcileChildFibers(
//   returnFiber: FiberNode,
//   currentFirstChild: MaybeFiberNode,
//   newChild: TElement
// ) {
//   // If it is a React element.
//   if (typeof newChild === 'object' && newChild !== null) {
//     return reconcileSingleElement(returnFiber, currentFirstChild, newChild)
//   } else if (Array.isArray(newChild)) {
//     return null
//     // return reconcileChildrenArray(returnFiber, currentFirstChild, newChild)
//   } else {
//     // newChild is a direct text child of a Host node. For this text child, we don't need to create a fier node.
//     return null
//   }
// }

// Reconcile means creating or cloning a fiber node based on the React element.
function reconcileSingleElement(
  returnFiber: FiberNode,
  currentFirstChild: MaybeFiberNode,
  element: TElement
) {
  const child = currentFirstChild
  const createdFiberNode = createFiberFromElement(element)
  createdFiberNode.return = returnFiber
  createdFiberNode.child = child
  return createdFiberNode
}

function createHostRootFiber(root: FiberRootObject, element: TElement) {
  const current = createFiber(root)
  current.updateQueue = {
    baseState: element,
  }
  current.stateNode = root
  // Point the alternate to `workInProgress`.
  current.alternate = createFiber(root)

  // Copy some information from the `current`.
  const workInProgress = current.alternate
  workInProgress.updateQueue = current.updateQueue
  workInProgress.stateNode = current.stateNode
  // Point the alternate to `current`.
  workInProgress.alternate = current
  return current
}

function createFiberFromElement(element: TElement) {
  const type = element.type
  const key = element.key
  const pendingProps = element.props
  const fiber = createFiberFromTypeAndProps(type, key, pendingProps)
  return fiber
}

function createFiberFromTypeAndProps(type: any, key: any, props: any) {
  let fiberTag = TFiberNodeTags.NONE

  switch (typeof type) {
    case 'function': {
      fiberTag = TFiberNodeTags.FUNCTION_COMPONENT
      break
    }
    case 'string': {
      fiberTag = TFiberNodeTags.HOST_COMPONENT
      break
    }
    default: {
      fiberTag = TFiberNodeTags.NONE
    }
  }

  const fiber = createFiber(type, props, key)
  fiber.tag = fiberTag

  return fiber
}

function createFiber(type: TElementType, props: any = null, key?: any) {
  const fiberNode = new FiberNode(type, props, key)

  if (type instanceof FiberRootObject) {
    fiberNode.tag = TFiberNodeTags.HOST_ROOT
  } else if (typeof type === 'string') {
    fiberNode.tag = TFiberNodeTags.HOST_COMPONENT
  } else if (typeof type === 'function') {
    fiberNode.tag = TFiberNodeTags.FUNCTION_COMPONENT
  } else {
    fiberNode.tag = TFiberNodeTags.NONE
  }
  return fiberNode
}

function completeUnitOfWork() {
  // returns or assign the nextUnitOfWork via `sibling`. If the `completedWork` doesnt have `child`, then set
  // the completeWork and workInProgress to the returnFiber/parent of the `completeWork`.
}

function completeWork() {
  // Do a switch for the workInProgress.tag
  // If tag is HOST_COMPONENT, then create dom element with the pendingProps. And because the children of
  // the workInProgress is already been created, children is created first before its parent, then
  // we can append the direct children of the dom element. Don't need to include the inclusive descendants of the parent element
  // because those are already appended to the children dom elements.
}

render(jsx(App), document.createElement('div'))

function render(element: TElement, container: HTMLElement) {
  const root = new FiberRootObject()
  root.current = createHostRootFiber(root, element)
  fiberRootObject = root

  const workInProgress = fiberRootObject.current?.alternate
  // Invoking `workLoopSync` will start the "render" phase.
  workLoopSync(workInProgress as FiberNode)

  // After "render" phase, React will start the "commit" phase.
}

function App() {
  return jsx(Test)
}

function Test() {
  return jsx(
    'div',
    {},
    jsx(
      'span',
      {
        color: 'yellow',
      },
      'Hello world'
    )
  )
}

function jsx(type: any, props: any = {}, children: any = null): TElement {
  let elementProps: any = {}
  elementProps = {
    ...props,
  }
  if (children) {
    elementProps.children = children
  }
  return {
    type,
    props: elementProps,
    key: props.key,
  }
}
