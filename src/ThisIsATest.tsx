import isUnitLessNumber from './isUnitLessNumber'
import registerEvents from './registerEvents'

export default function ThisIsATest() {
  return (
    <div>
      <span onClick={() => {}} onKeyUp={() => {}}>
        Hello world
      </span>
    </div>
  )
}

// TODO:
// - We need to support children for fiber nodes. Right now, are algorithm only works for fiber which has only 1 child.
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

enum TCommonProps {
  STYLE = 'style',
  CHILDREN = 'children',
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

let $fiberRootObject: FiberRootObject | null = null
let $workInProgress: MaybeFiberNode = null
let $rootContainer: HTMLElement | null = null

function workLoopSync(unitOfWork: FiberNode) {
  $workInProgress = unitOfWork
  while ($workInProgress !== null) {
    // Start of the "render phase".
    $workInProgress = performUnitOfWork($workInProgress)
  }

  // Start "commit phase".

  // The following codes doesnt really follow the React's commit phase algorithm.
  // Following codes only appends the top level dom node from fiber to the $rootContainer.

  let currentFiberNode: MaybeFiberNode = unitOfWork
  while (currentFiberNode !== null) {
    // Start looking to the host root then to its first child. Then if this first child doesnt have child
    // then navigate to the sibling. If no sibling, then go back to the parent (host root). Then navigate
    // to the sibling of the parent. Because its host root, it doesnt have sibling and also doesnt have parent, then
    // exit while loop.
    if (currentFiberNode.tag === TFiberNodeTags.HOST_COMPONENT) {
      $rootContainer?.appendChild(currentFiberNode.stateNode)
      break
    }
    const nextFiberNode = currentFiberNode.child as MaybeFiberNode
    if (nextFiberNode === null) {
      let finishedFiberNode: MaybeFiberNode = currentFiberNode
      do {
        const sibling = finishedFiberNode.sibling as MaybeFiberNode
        if (sibling !== null) {
          currentFiberNode = sibling
        }
        // Go back to the parent so that it can navigate to the parent sibling.
        finishedFiberNode = finishedFiberNode.return
      } while (finishedFiberNode != null)
    } else {
      currentFiberNode = nextFiberNode
    }
  }
}

function performUnitOfWork(unitOfWork: FiberNode) {
  const current = unitOfWork.alternate

  let nextUnitOfWork: MaybeFiberNode = beginWork(current, unitOfWork)
  // Assign the new props of the unitOfWork to its memoizedProps if all `beginWork` works are done.
  // This new props will be the props of the fiber node to the next current state of the app.
  unitOfWork.memoizedProps = unitOfWork.pendingProps

  if (nextUnitOfWork === null) {
    completeUnitOfWork(unitOfWork)
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

    // Basically, if there is state chagnes in the component and this state is passed to its child component. then it means that before React creates/clone the fiber of the child component of the workInProgress fiber node, it needs to compute
    // first its "state" then pass the "new" props to the cloned fiber node via its `fiberNode.pendingProps`.
    // With this, whenever that cloned fiber node is the `workInProgress` handle by `beginWork`, the next props (pendingProps) is already computed. And React will diff this node via its `workInProgress.memoizedProps` and `workInProgress.pendingProps`.

    case TFiberNodeTags.HOST_COMPONENT: {
      // Map its react children to fiber nodes and return its first child
      // The generated fiber nodes are based on the React children. Means it will copy the information from the react elements to create fiber nods like "props".
      // So the meaning of "reconcile" in here is to create or clone a fiber nodes based on the React elements and if there is - to its current fiber nodes (workInProgress.alternate).
      // And these changes are determined by its state and props.
      return updateHostComponent(current, workInProgress)
    }
    default: {
      // Map its react children to fiber nodes and return its first child
      // The generated fiber nodes are based on the React children. Means it will copy the information from the react elements to create fiber nods like "props".
      // So the meaning of "reconcile" in here is to create or clone a fiber nodes based on the React elements and if there is - to its current fiber nodes (workInProgress.alternate).
      // And these changes are determined by its state and props.
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
  // Get the React sub-tree react elements.
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

// This function and `reconcileChildren` are kinda the same. These functions are used for creating/cloning fiber node.
// One of the difference is that `reconcileChildren` tracks side effects.
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

// This function and `mountChildFibers` are kinda the same. These functions are used for creating/cloning fiber node.
// One of the difference is that `reconcileChildren` tracks side effects.
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

function createFiberFromElement(element: TElement) {
  const type = element.type
  const key = element.key
  const pendingProps = element.props
  const fiber = createFiber(type, pendingProps, key)
  return fiber
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

function completeUnitOfWork(unitOfWork: FiberNode) {
  // Attempt to complete the current unit of work, then move to the next
  // sibling. If there are no more siblings, return to the parent fiber.
  let completedWork: MaybeFiberNode = unitOfWork
  do {
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    const current = completedWork.alternate
    const returnFiber: MaybeFiberNode = completedWork.return // Check if the work completed or if something threw.
    // Creates the host node and then append its children.
    completeWork(current, completedWork)

    const siblingFiber = completedWork.sibling
    if (siblingFiber !== null) {
      // If there is more work to do in this returnFiber, do that next.
      return siblingFiber
    }
    // Otherwise, return to the parent
    completedWork = returnFiber
    $workInProgress = completedWork // Update the next thing we're working on in case something throws.
  } while (completedWork !== null) // We've reached the root.

  // After the loop, the $workInProgress is already null. There is no `unitOfWork` for "render phase" because we already reached the loop, then React
  // can prepare the Fiber tree for "commit phase".
}

function completeWork(current: MaybeFiberNode, workInProgress: FiberNode) {
  switch (workInProgress.tag) {
    case TFiberNodeTags.HOST_COMPONENT: {
      const type = workInProgress.type
      const newProps = workInProgress.pendingProps
      const rootContainerInstance = getRootHostContainer()

      // For now, our mock only supports the "initial render". In the future maybe, we will also support the "re-render".
      // So because it only supports "initial render", then immediately create a host instance.
      const instance = createInstance(
        type,
        newProps,
        rootContainerInstance as HTMLElement
      )
      // Append to the `instance` or to the parent its children dom nodes.
      // Skip if the children is "text".
      appendAllChildren(instance, workInProgress)
      // Setting the dom properties based on the new props.
      finalizeInitialChildren(instance, type, newProps)
      workInProgress.stateNode = instance
      return null
    }
    default: {
      return null
    }
  }

  // Do a switch for the workInProgress.tag
  // If tag is HOST_COMPONENT, then create dom element with the pendingProps. And because the children of
  // the workInProgress is already been created, children is created first before its parent, then
  // we can append the direct children of the dom element. Don't need to include the inclusive descendants of the parent element
  // because those are already appended to the children dom elements.
}

function createInstance(
  type: any,
  props: any,
  rootContainerInstance: HTMLElement
) {
  // Its good to validate the `DOM` nesting of the nodes before creating dom nodes.
  const domElement = createElement(type, props, rootContainerInstance)
  return domElement
}

function createElement(
  type: any,
  props: any,
  rootContainerInstance: HTMLElement
) {
  const ownerDocument = getOwnerDocumentFromRootContainer(rootContainerInstance)
  const element = ownerDocument.createElement(type)
  return element
}

// TODO: Review this function.
function appendAllChildren(parent: HTMLElement, workInProgress: FiberNode) {
  // Note that the children dome nodes of the workInProgress are already created or whenever React handles the parent
  // node, the children nodes are already created.
  let node = workInProgress.child

  while (node !== null) {
    // If the child node is a host component, let say DOM node, then append the child node to the parent
    if (node.tag === TFiberNodeTags.HOST_COMPONENT) {
      appendInitialChild(parent, node.stateNode)
    }

    // If the child noe is equal to its parent.
    if (node === workInProgress) {
      return
    }

    // If the node doesnt have sibling.
    while (node?.sibling === null) {
      // Get back to the parent
      node = node.return
    }

    if (node) {
      // If the node has sibling.
      // Then set the parent of sibling of node to its same parent. Of course :)
      node.sibling.return = node.return
      // Then iterate again against the sibling of the current node.
      node = node.sibling
    }
  }
}

function appendInitialChild(parentInstance: HTMLElement, child: HTMLElement) {
  parentInstance.appendChild(child)
}

function finalizeInitialChildren(
  domElement: HTMLElement,
  type: any,
  props: any
) {
  setInitialDOMProperties(type, domElement, props)
}

function setInitialDOMProperties(
  tag: string,
  domElement: HTMLElement,
  nextProps: any
) {
  for (const propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue
    }
    const nextProp = nextProps[propKey]
    if (propKey === TCommonProps.STYLE) {
      setValueForStyles(domElement, nextProp)
    } else if (propKey === TCommonProps.CHILDREN) {
      if (typeof nextProp === 'string') {
        // Avoid setting initial textContent when the text is empty. In IE11 setting
        // textContent on a <textarea> will cause the placeholder to not
        // show within the <textarea> until it has been focused and blurred again.
        // https://github.com/facebook/react/issues/6731#issuecomment-254874553
        const canSetTextContent = tag !== 'textarea' || nextProp !== ''
        if (canSetTextContent) {
          setTextContent(domElement, nextProp)
        }
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, '' + nextProp)
      }
    } else if (registerEvents.hasOwnProperty(propKey)) {
      // Register the event. In react codebzse, the way it register the events are different on this.
      // One is, in here we didn't handle the removing of "event". IN react of course, events are removed
      // if the elements are also removed.
      // @ts-ignore
      const eventName = registerEvents[propKey][0]
      domElement.addEventListener(eventName, nextProp)
    }
  }
}

/**
 * Sets the value for multiple styles on a node.  If a value is specified as
 * '' (empty string), the corresponding style property will be unset.
 *
 * @param {DOMElement} node
 * @param {object} styles
 */

function setValueForStyles(node: HTMLElement, styles: any) {
  const style = node.style

  for (let styleName in styles) {
    const styleValue = dangerousStyleValue(styleName, styles[styleName])
    if (styleName === 'float') {
      styleName = 'cssFloat'
    }
    style[styleName as any] = styleValue
  }
}

function dangerousStyleValue(name: string, value: string | number) {
  // Note that we've removed escapeTextForBrowser() calls here since the
  // whole string will be escaped when the attribute is injected into
  // the markup. If you provide unsafe user data here they can inject
  // arbitrary CSS which may be problematic (I couldn't repro this):
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
  // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
  // This is not an XSS hole but instead a potential CSS injection issue
  // which has lead to a greater discussion about how we're going to
  // trust URLs moving forward. See #2115901
  const isEmpty = value == null || typeof value === 'boolean' || value === ''
  if (isEmpty) {
    return ''
  }

  if (
    typeof value === 'number' &&
    value !== 0 &&
    // @ts-ignore
    !(isUnitLessNumber.hasOwnProperty(name) && isUnitLessNumber[name])
  ) {
    return value + 'px' // Presumes implicit 'px' suffix for unitless numbers
  }
  return ('' + value).trim()
}

function setTextContent(node: HTMLElement, text: string) {
  node.textContent = text
}

function getOwnerDocumentFromRootContainer(
  rootContainerElement: Node
): Document {
  // If the root container is the `ownerDocument`, then return it. Else, return its `ownerDocument`.
  return rootContainerElement.nodeType === 9
    ? (rootContainerElement as Document)
    : (rootContainerElement.ownerDocument as Document)
}

function getRootHostContainer() {
  return $rootContainer
}

render(jsx(App), document.getElementById('test') as HTMLElement)

function render(element: TElement, container: HTMLElement) {
  const root = new FiberRootObject()
  root.current = createHostRootFiber(root, element)
  $fiberRootObject = root
  $rootContainer = container

  const workInProgress = $fiberRootObject.current?.alternate
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
