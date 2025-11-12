import { signal } from "./reactivity";

export function createVirtualizedList<T>(options: {
  items: T[] | (() => T[]);
  renderItem: (item: T, index: number) => Node;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const {
    items,
    renderItem,
    itemHeight,
    containerHeight,
    overscan = 5
  } = options;
  
  const scrollTop = signal(0);
  
  // Calculate visible range based on scroll position
  function getVisibleRange() {
    const currentScrollTop = scrollTop.get();
    const startIndex = Math.max(0, Math.floor(currentScrollTop / itemHeight) - overscan);
    const itemsArray = typeof items === 'function' ? items() : items;
    const endIndex = Math.min(
      itemsArray.length - 1,
      Math.ceil((currentScrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }
  
  // Get only the visible items
  function getVisibleItems() {
    const itemsArray = typeof items === 'function' ? items() : items;
    const { startIndex, endIndex } = getVisibleRange();
    return itemsArray.slice(startIndex, endIndex + 1).map((item, i) => ({
      item,
      index: startIndex + i,
      offsetY: (startIndex + i) * itemHeight
    }));
  }
  
  // Calculate total height of all items
  function getTotalHeight() {
    const itemsArray = typeof items === 'function' ? items() : items;
    return itemsArray.length * itemHeight;
  }
  
  // Handle scroll events
  function handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    scrollTop.set(target.scrollTop);
  }
  
  // Create the virtualized list
  return {
    scrollTop,
    getVisibleItems,
    getTotalHeight,
    handleScroll,
    renderList() {
      const totalHeight = getTotalHeight();
      const visibleItems = getVisibleItems();
      
      // Create container element
      const container = document.createElement('div');
      container.style.height = `${containerHeight}px`;
      container.style.overflowY = 'auto';
      container.style.position = 'relative';
      container.addEventListener('scroll', handleScroll);
      
      // Create content container
      const content = document.createElement('div');
      content.style.height = `${totalHeight}px`;
      content.style.position = 'relative';
      
      // Add visible items
      visibleItems.forEach(({ item, index, offsetY }) => {
        const itemNode = renderItem(item, index);
        if (itemNode instanceof Node) {
          if (itemNode instanceof HTMLElement) {
            itemNode.style.position = 'absolute';
            itemNode.style.top = `${offsetY}px`;
            itemNode.style.left = '0';
            itemNode.style.right = '0';
            itemNode.style.height = `${itemHeight}px`;
            content.appendChild(itemNode);
          } else {
            // Wrap non-element nodes in a div
            const wrapper = document.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.top = `${offsetY}px`;
            wrapper.style.left = '0';
            wrapper.style.right = '0';
            wrapper.style.height = `${itemHeight}px`;
            wrapper.appendChild(itemNode);
            content.appendChild(wrapper);
          }
        }
      });
      
      container.appendChild(content);
      return container;
    }
  };
}
