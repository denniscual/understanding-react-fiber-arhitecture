// In linkedlist, nodes manipulation is very cheap. Its O(1) but accessing and finding is expensive
// because its linear - based on the number of nodes or based on the position O(p).
export default class DoublyLinkedList {
  head: Node | null
  tail: Node | null

  constructor() {
    this.head = null
    this.tail = null
  }

  public setHead(node: Node) {
    // if `this.head` is null, then the linked list is not yet initialised.
    // in our implementation the first node will be the `head` and also the `tail`.
    if (!this.head) {
      this.head = node
      this.tail = node
    } else {
      // because the `head` is already given and we want to set the given as node as the new head the
      // we will insert the node before the current head.
      this.insertBefore(this.head, node)
    }
  }

  public setTail(node: Node) {
    if (!this.tail) {
      this.tail = node
      this.head = node
    } else {
      // because the `tail` is already given and we want to set the given as node as the new tail the
      // we will insert the node after the current tail.
      this.insertAfter(this.tail, node)
    }
  }

  // O(1) time = when inserting a node before the given node let say head,
  // we don't need to traverse to several nodes or the other nodes dont need
  // to change its position jsut to insert the node. It only involves some elementary operations.
  // O(1) space = when inserting, the cost of the space in memory is constant.
  public insertBefore(node: Node, nodeToInsert: Node) {
    // if the nodeToInsert is the head and the tail, then do nothing.
    if (nodeToInsert === this.head && nodeToInsert === this.tail) return

    // create a new connection considering we aremove the `nodeToInsert`.
    this.remove(nodeToInsert)
    // capture the prev node of the given node. this could be a null or node.
    // if null, then it is head.
    //
    // node = 3, prev = 2
    // node to insert
    const prevNodeOfTheGivenNode = node.prev

    // connect the adjacent nodes to `nodeToInsert`.
    nodeToInsert.next = node
    nodeToInsert.prev = prevNodeOfTheGivenNode
    // currently, the given node is not yet connected to `nodeToInsert` as its prev node.
    // make the `nodeToInsert` as the new prevous node of the `node.`
    node.prev = nodeToInsert

    // if the prev node of the given node is null, then it is `head`.
    if (!prevNodeOfTheGivenNode) {
      // update the head.
      this.head = nodeToInsert
    }
    // if the `node` is not null, then `prevNodeOfTheGivenNode` must be connected to the `nodeToInsert`
    // as its new next. Before this, `prevNodeOfTheGivenNode` is connected to the `node` as its next.
    // we need to break that.
    else {
      prevNodeOfTheGivenNode.next = nodeToInsert
    }
  }

  // O(1) time = when inserting a node after the given node let say head,
  // we don't need to traverse to several nodes or the other nodes dont need
  // to change its position jsut to insert the node. It only involves some elementary operations.
  // O(1) space = when inserting, the cost of the space in memory is constant.
  public insertAfter(node: Node, nodeToInsert: Node) {
    // if the nodeToInsert is the head and the tail, then do nothing.
    if (nodeToInsert === this.head && nodeToInsert === this.tail) return

    // create a new connection considering we aremove the `nodeToInsert`.
    this.remove(nodeToInsert)

    // capture the prev node of the given node. this could be a null or node.
    // if null, then it is head.
    const nextNodeOfTheGivenNode = node.next

    // connect the adjacent nodes to `nodeToInsert`.
    nodeToInsert.prev = node
    nodeToInsert.next = nextNodeOfTheGivenNode
    // currently, the given node is not yet connected to `nodeToInsert` as its prev node.
    // make the `nodeToInsert` as the new prevous node of the `node.`
    node.next = nodeToInsert

    // if the prev node of the given node is null, then it is `head`.
    if (!nextNodeOfTheGivenNode) {
      // update the head.
      this.tail = nodeToInsert
    }
    // if the `node` is not null, then `prevNodeOfTheGivenNode` must be connected to the `nodeToInsert`
    // as its new next. Before this, `prevNodeOfTheGivenNode` is connected to the `node` as its next.
    // we need to break that.
    else {
      nextNodeOfTheGivenNode.prev = nodeToInsert
    }
  }

  // O(p) + O(i) time = O(p)
  // its basically O(p) because we need to traverse to the given position and insert the node.
  public insertAtPosition(position: number, nodeToInsert: Node) {
    // Write your code here.

    // if position is in head. use `setHead`.
    if (position === 1) {
      this.setHead(nodeToInsert)
    } else {
      let currentPosition = 1
      let currentNode = this.head
      // position > 1
      while (currentNode && position !== currentPosition) {
        // current position 1
        // and in first cb, current node is head.

        // then this statement will set the next current node which is the head.next.
        currentNode = currentNode.next
        currentPosition++
      }

      if (!currentNode) {
        return
      }

      this.insertBefore(currentNode, nodeToInsert)

      // next could be node or null given that the `currentNode` which is the next is t
    }

    // if position is in between, then we can use the `insertBefore`.
  }

  public removeNodesWithValue(value: number) {
    // Write your code here.
    // we need to traverse to linked list to be able we can know the position of the node with the given value.
    // In linked list, the traversing will always start to head or this is the common behaviuor.
    // traverse starting from the head to other nodes to know the position of the value

    let currentNode = this.head

    // we need to traverse to linked list to remove all of the nodes with the given value.
    // if the current node is now set to tail, then the next current node will be set to null.
    // it means that this function will traverse to all nodes because it needs to reach the tail to check
    // if the tail is also need to remove then the next of tail is null which will finish the loop.
    while (currentNode) {
      const nodeToRemove = currentNode
      currentNode = nodeToRemove.next
      // value is 2 then 2nd node is true
      if (nodeToRemove.value === value) {
        this.remove(nodeToRemove)
      }
    }
  }

  // when removing a node to linked list, we just need to update the `prev` and `next` of the node
  // to null. Setting to null will remove the connection of the node to the linked list.
  public remove(node: Node) {
    // Do works for head
    if (this.head === node) {
      this.head = node.next
      if (this.head) this.head.prev = null
    }
    // Do works for tail
    if (this.tail === node) {
      this.tail = node.prev
      if (this.tail) this.tail.next = null
    }
    // the node which we want to remove is between the head and the tail. So it has prev and next.
    else {
      // when removing a node, we need to update the its adjacent nodes. When we say adjacent nodes
      // it sibling nodes, ung katabi niya.
      const prevNode = node.prev
      const nextNode = node.next

      // we cant set immediately the node.prev and node.next to null rather we will update first the adjancent nodes.
      if (prevNode && nextNode) {
        // acces the next of the nprevNode and set it to next
        prevNode.next = nextNode
        // acess the prev of the next a
        nextNode.prev = prevNode

        node.next = null
        node.prev = null
      }
    }
  }

  // O(n) time = when checking if the value is exist ornot,
  // we need to traverse from `heade` to etc to check the value.
  // O(1) space = when checking if the node with value is in the linkedlist,
  // we are not doing anything in memory.
  public containsNodeWithValue(value: number) {
    // when checking, we need to traverse from head.
    let node = this.head // O(1)

    // if the current node.value is not equal to value, then
    // we need to set the current node to `next`. Not equal to value, is
    // just means that the current node doesnt contain the passed value.
    // so we need to check the next node and do some iterations.
    while (node && node.value !== value) {
      // O(1)
      node = node.next // O(1) * `n` such that `n` is the number of nodes in the linkedlist.
    }

    // do some type-casting if the node has value or none.
    return Boolean(node) // O(1)
  }
  // = O(1) + O(1) + (O(1) * n) + O(1)
  // group the same terms
  // = O(3) + O(1)n
  // when dealing with asymptotic notation, we need to remove the less significant terms.
  // and thats the terms with smaller growth. which the smaller growth is the constant one.
  // we also need to remove the coefficient because this could complicate.
  // We need to remove the O(3) and the coefficient of `n` which result to
  // = O(n)

  public sizeOfNodes() {
    let counter = 0
    let currentNode = this.head

    // loop as long the current node is defined
    while (currentNode) {
      counter++
      currentNode = currentNode.next
    }

    return counter
  }
}

class Node {
  value = 0
  prev: Node | null
  next: Node | null

  constructor(value: number) {
    this.value = value
    this.prev = null
    this.next = null
  }
}

function foo() {
  // size is 4
  const headNode = new Node(1)
  const node2 = new Node(2)
  const node3 = new Node(2)
  const tailNode = new Node(3)

  // linking
  headNode.next = node2
  node2.prev = headNode
  node2.next = node3
  node3.prev = node2
  node3.next = tailNode
  tailNode.prev = node3

  const linkedList = new DoublyLinkedList()
  linkedList.head = headNode
  linkedList.tail = tailNode

  /* console.log('node isContain', linkedList.containsNodeWithValue(2)) */
  /* linkedList.removeNodesWithValue(2) */
  /* console.log('node isContain', linkedList.containsNodeWithValue(2)) */
  /* linkedList.removeNodesWithValue(3) */
  linkedList.removeNodesWithValue(1)
  linkedList.removeNodesWithValue(2)
  linkedList.removeNodesWithValue(3)

  console.log('size of nodes', linkedList.sizeOfNodes())
  console.log('head', linkedList.head)
  console.log('tail', linkedList.tail)
}

foo()
