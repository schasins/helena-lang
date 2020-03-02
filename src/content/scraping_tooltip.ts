/**
 * Extend Element to allow tooltips to be attached.
 * TODO: cjbaik: combine with any other Element extensions in codebase.
 */
interface ElementWithTooltip extends Element {
  scrapingTooltip: ScrapingTooltip;
}

/**
 * Tooltip for giving user feedback about the element they're hovering over.
 */
export class ScrapingTooltip {
  public static DEFAULT_TOOLTIP_COLOR = "rgba(255, 255, 255, 0.9)";

  tooltipElement: JQuery<HTMLElement>;

  /**
   * Create a tooltip for giving user feedback about the element.
   * @param element element to create tooltip for
   * @param tooltipColor color of tooltip
   */
  constructor(element: ElementWithTooltip,
      tooltipColor = ScrapingTooltip.DEFAULT_TOOLTIP_COLOR) {
    let nodeText = NodeRep.nodeToText(element);
    if (nodeText) {
      nodeText = nodeText.replace(/\n/g, "<br>");
      if (nodeText.length > 400) {
        nodeText = nodeText.slice(0,200) + "..." +
          nodeText.slice(nodeText.length - 200, nodeText.length);
      }
    }
    let boundRect = element.getBoundingClientRect();
    let newDiv = $('<div>'+nodeText+'<div/>');
    let width = boundRect.width;
    let threshold = 150;
    if (width < threshold) { width = threshold; }

    newDiv.attr('id', 'vpbd-hightlight');
    newDiv.css('width', width);
    newDiv.css('top', document.body.scrollTop + boundRect.top + boundRect.height);
    newDiv.css('left', document.body.scrollLeft + boundRect.left);
    newDiv.css('position', 'absolute');
    newDiv.css('z-index', 2147483647);
    newDiv.css('background-color', tooltipColor);
    newDiv.css('box-shadow', '0px 0px 5px grey');
    newDiv.css('padding', '3px');
    newDiv.css('overflow', 'hidden');
    newDiv.css('overflow-wrap', 'break-word');

    $(document.body).append(newDiv);

    this.tooltipElement = newDiv;
    element.scrapingTooltip = this;
  }

  /**
   * Remove this ScrapingTooltip from the element it is attached to.
   */
  public destroy() {
    this.tooltipElement.remove();
  }

  /**
   * Remove scraping tooltip from the element.
   * @param element element to remove scraping tooltip from
   */
  public static destroy(element: ElementWithTooltip) {
    if (element.scrapingTooltip) {
      element.scrapingTooltip.destroy();
    }
  }
}