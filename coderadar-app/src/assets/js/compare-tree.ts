import * as $ from 'jquery';
import {canvasArrow, checkOnActiveDependency, expand, findLastHTMLElement, toggle} from "./tree-functions";
import html2canvas from "html2canvas";

let ctx;
let htmlBuffer = [];
let checkDown;
let checkUp;
let checkChanged;
let headerBackground;
let activeDependency;

$.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
  return this.each(() => {
    let clicks = 0, self = this;
    // if a click occurs
    $(this).click(event => {
      // raise click counter
      clicks++;
      // if this is the first click, start a timer with @timeout millis
      if (clicks == 1) {
        setTimeout(function(){
          // on timer's timeout check if a second click has occurred.
          if(clicks == 1) {
            single_click_callback.call(self, event);
          } else {
            double_click_callback.call(self, event);
          }
          // reset click counter
          clicks = 0;
        }, timeout || 300);
      }
    });
  });
};

// TODO move action listener
export function afterCompareLoad(node) {
  htmlBuffer = [];
  buildRoot(node);
  document.getElementById('3dependencyTree').innerHTML = htmlBuffer.join('');
  checkUp = (document.getElementById('3showUpward') as HTMLInputElement).getAttribute('checked') == 'checked';
  checkDown = (document.getElementById('3showDownward') as HTMLInputElement).getAttribute('checked') == 'checked';
  checkChanged = (document.getElementById('3showChanged') as HTMLInputElement).getAttribute('checked') == 'checked';
  ctx = (document.getElementById('3canvas') as HTMLCanvasElement).getContext('2d');
  headerBackground = (document.getElementById('3headerBackground') as HTMLElement);

  // add toggle function (click and dblclick)
  let toggler = document.getElementsByClassName('clickable');
  for (let i = 0; i < toggler.length; i++) {
    $(toggler[i]).single_double_click(() => {
      // set toggler[i] to active dependency
      if (activeDependency === toggler[i]) {
        activeDependency = undefined;
        document.getElementById('3activeDependency').textContent = 'No active dependency chosen.';
      } else {
        activeDependency = toggler[i];
        // @ts-ignore
        document.getElementById('3activeDependency').textContent = toggler[i].textContent;
      }
      // clear and draw arrows for active dependency
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      loadDependencies(node);
    }, () => {
      if (toggler[i].nextSibling != null) {
        toggle(toggler[i], activeDependency, ctx, headerBackground);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        loadDependencies(node);
      }
    });
    // collapse and extend elements
    if (toggler[i].nextSibling != null) {
      expand(toggler[i] as HTMLElement);
    }
  }
  // show upward listener
  document.getElementById('3showUpward').addEventListener('click', () => {
    checkUp = !checkUp;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    loadDependencies(node);
  });
  // show upward listener
  document.getElementById('3showDownward').addEventListener('click', () => {
    checkDown = !checkDown;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    loadDependencies(node);
  });
  // show changed listener
  document.getElementById('3showChanged').addEventListener('click', () => {
    checkChanged = !checkChanged;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    loadDependencies(node);
  });

  // ggf. ergänzen durch show added, show deleted, ..

  // screenshot listener
  document.getElementById('3screenshot').addEventListener('click', () => {
    html2canvas(document.getElementById("3canvasContainer"), {
      width: document.getElementById('3list__root').offsetWidth,
      height: document.getElementById('3list__root').offsetHeight
    }).then(canvas => {
      let link = document.createElement("a");
      link.href = canvas.toDataURL('image/jpg');
      link.setAttribute('href', canvas.toDataURL('image/jpg'));
      link.setAttribute('download', 'dependencyStructure.jpg');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });
  // resize listener
  window.addEventListener('resize', () => {
    ctx.canvas.height = document.getElementById('3list__root').offsetHeight;
    ctx.canvas.width = document.getElementById('3list__root').offsetWidth;
    headerBackground.style.width = document.getElementById('3list__root').offsetWidth + 'px';
    loadDependencies(node);
  });

  // set canvas format and draw compareDependencies
  ctx.canvas.height = document.getElementById('3list__root').offsetHeight;
  ctx.canvas.width = document.getElementById('3list__root').offsetWidth;
  headerBackground.style.width = document.getElementById('3list__root').offsetWidth + 'px';
  loadDependencies(node);
}

function loadDependencies(node) {
  if (node.compareDependencies.length > 0 && node.compareChildren.length === 0) {
    listDependencies(node);
  }
  if (node.compareChildren.length > 0) {
    for (let child of node.compareChildren) {
      loadDependencies(child);
    }
  }
}

// TODO in eigene Klasse packen
function buildRoot(currentNode) {
  htmlBuffer.push(`<table id="3list__root" class="list list__root active">`);
  htmlBuffer.push(`<tr><td class="package package__base">` +
    `<span id="${currentNode.path}" class="filename-span`+
    `${currentNode.compareChildren.length > 0 && currentNode.packageName !== '' ? ' clickable' : ''}` +
    `">${currentNode.filename}</span>`);

  addTable(currentNode);
  htmlBuffer.push(`</td></tr></table>`);
}

function buildTree(currentNode, span) {
  let level = -1;
  let localBuffer = [];
  localBuffer.push(currentNode.compareChildren.length <= 1 ? '' : '<tr style="display: none">');
  for (const child of currentNode.compareChildren) {
    let classString, childAdded, childRemoved;
    if (child.compareChildren.length > 0) {
      classString = 'package';
    } else if (child.compareDependencies.length > 0) {
      classString = 'class--dependency';
    } else if (child.compareChildren.length === 0 && child.compareDependencies.length === 0) {
      classString = 'class';
    }
    if (child.changed === 'ADD') {
      classString += ' added';
      childAdded = true;
    } else if (child.changed === 'DELETE') {
      classString += ' removed';
      childRemoved = true;
    }

    if (span) {
      htmlBuffer.push(`<span id="${child.path}" class="filename-span` +
        `${(child.compareChildren.length > 1 || child.compareDependencies.length > 0) && child.packageName !== '' ? ' clickable' : ''}">` +
        `${'/' + child.filename}</span>`);

      addTable(child);
    } else {
      htmlBuffer.push(level !== child.level ? '</tr><tr>' : '');
      htmlBuffer.push(`<td class="${classString}"><span id="${child.path}" class="filename-span` +
        `${(child.compareChildren.length > 1 || child.compareDependencies.length > 0) && child.packageName !== '' ? ' clickable' : ''}">` +
        `${child.filename}</span>`
      );
      level = child.level;
      addTable(child);
      htmlBuffer.push('</td>');
    }
  }
  htmlBuffer.push(currentNode.children.length <= 1? '' : '</tr>');
}

function addTable(child) {
  if (child.compareChildren.length > 1) {
    htmlBuffer.push(`<table class="list${child.packageName !== '' ? ' nested' : ''}">`);
    htmlBuffer.push(buildTree(child, child.compareChildren.length === 1));
    htmlBuffer.push('</table>');
  } else {
    htmlBuffer.push(buildTree(child, child.compareChildren.length === 1));
  }
}

function listDependencies(currentNode) {
  ctx.lineWidth = 1;
  // draw arrows to my compareDependencies and call this function for my compareDependencies
  if (currentNode.compareDependencies.length > 0) {
    currentNode.compareDependencies.forEach(dependency => {
      // find last visible element for dependency as end

      let end = findLastHTMLElement(dependency) as HTMLElement;
      // find last visible element for currentNode as start
      let start = findLastHTMLElement(currentNode) as HTMLElement;

      // if activeDependency is set, draw only activeDependency related compareDependencies
      if (activeDependency !== undefined) {
        let draw = false;
        // activeDependency is set and neither start or end
        let tmp = start;
        while (!tmp.classList.contains('list__root')) {
          if (tmp === activeDependency) {
            draw = true;
            break;
          }
          tmp = tmp.parentNode.parentNode.parentNode.parentNode.parentNode.firstChild as HTMLElement;
        }
        if (!draw) {
          tmp = end;
          while (!tmp.classList.contains('list__root')) {
            if (tmp === activeDependency) {
              draw = true;
              break;
            }
            tmp = tmp.parentNode.parentNode.parentNode.parentNode.parentNode.firstChild as HTMLElement;
          }
        }
        if (!draw) {
          return;
        }
      }

      start = start.parentNode as HTMLElement;
      end = end.parentNode as HTMLElement;

      // use jquery for position calculation because plain js position calculation working with offsets returns
      // different values for chrome and firefox
      // (ref: https://stackoverflow.com/questions/1472842/firefox-and-chrome-give-different-values-for-offsettop).
      let startx = $(start).offset().left + start.offsetWidth / 2;
      let starty = $(start).offset().top + start.offsetHeight - $(ctx.canvas).offset().top;
      let endx = $(end).offset().left + end.offsetWidth / 2;
      let endy = $(end).offset().top - $(ctx.canvas).offset().top;

      //ignore all arrows with same start and end node
      if (start != end) {
        console.log(`${currentNode.filename} -> ${dependency.filename}: ${dependency.changed}; ${checkChanged}`);
        if (dependency.changed === 'ADD') {
          // check if downward compareDependencies should be shown
          if (checkDown && starty < endy) {
            canvasArrow(ctx, startx, starty, endx, endy, "lime");
          }
          // check if upward Dependencies should be shown
          if (checkUp && starty > endy) {
            canvasArrow(ctx, startx, starty, endx, endy, "lime");
          }
        } else if (dependency.changed === 'DELETE') {
          console.log('show deleted dependency');
          // check if downward compareDependencies should be shown
          if (checkDown && starty < endy) {
            canvasArrow(ctx, startx, starty, endx, endy, "red");
          }
          // check if upward Dependencies should be shown
          if (checkUp && starty > endy) {
            canvasArrow(ctx, startx, starty, endx, endy, "red");
          }
        } else if (!checkChanged && dependency.changed === null) {
          // check if downward compareDependencies should be shown
          if (checkDown && starty < endy) {
            canvasArrow(ctx, startx, starty, endx, endy, "black");
          }
          // check if upward Dependencies should be shown
          if (checkUp && starty > endy) {
            canvasArrow(ctx, startx, starty, endx, endy, "black");
          }
        }


      }
    });
  }
}