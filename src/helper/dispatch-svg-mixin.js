import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { select } from 'd3-selection'

/**
 * ##  DispatchSVG
 * 
 * dispatch template elements marked as slot-svg="svgID" to svgHost.to
 * Is mixed to multi-drawble;
 * 
 */

const DispatchSVG = dedupingMixin(superClass => {

  return class extends superClass {

    static get properties() {

      return {

        ...super.properties,

        /* 
         * `svgHost` the host to which [slog-svg] nodes must be stamped
         */
        svgHost: {
          type: Object,
          attribute: 'svg-host'
        }

      };
    }

    constructor() {
      super();
      this._hostedNodes = {};
    }

    getHostedNode(target) {
      return this._hostedNodes[target] || null;
    }

    update(props) {
      if (props.has('svgHost')) {
        if (this.svgHost && this.resize) {
          this.resize(this.svgHost.width, this.svgHost.height);
        }
        this.observeSvgHost(this.svgHost, props.get('svgHost'));
      }
      super.update(props);
    }

    observeSvgHost(host, old) {
      if (host && this.renderRoot) {
        this.renderRoot.querySelectorAll('[slot-svg]').forEach(node => {
          const target = node.getAttribute('slot-svg');
          const parent = (host.$ && host.$[target]) || host.renderRoot.querySelector(`#${target}`);
          if (parent) {
            this._hostedNodes[node.id || target] = node;
            const position = node.dataset.multiPosition;
            const appended = [...parent.childNodes].some(n => {
              if (node.dataset.multiPosition >= position) {
                parent.insertBefore(node, n);
                return true;
              }
            });
            if (!appended) {
              parent.appendChild(node);
            }

            // parent.appendChild(node);
            // Note(cg): reorder according to multi-position
            return;
            // select(targetNode).selectAll('>*').sort((a,b) => a.dataset.multiPosition - b.dataset.multiPosition);
            // return;
          }
          throw new Error(`cannot dispatch node ${target}`);
        });
        this.setHostStyle(host, old);
      }
      // Note(cg): .
      if (host === null && old) {
        Object.keys(this._hostedNodes).forEach(k => {
          this.renderRoot.appendChild(this._hostedNodes[k]);
          delete this._hostedNodes[k];
        });
      }
    }

    getRootHost(host) {
      while (host.svgHost) {
        host = host.svgHost;
      }
      return host;
    }

    // Note(cg): hack to inject style in host.
    setHostStyle(host) {
      if (this.constructor.hostStyles) {
        const name = this.constructor.name;
        host = this.getRootHost(host);
        if (!host.renderRoot.querySelector(`style[id=${name}]`)) {
          const st = document.createElement('style');
          st.id = name;
          st.innerHTML = this.constructor.hostStyles.cssText;
          host.renderRoot.appendChild(st);

        }
      }
    }

    // Note(cg): after Register is called by `multi-register-mixin` (multi-container-svg) once 
    afterRegister(host, containerName = 'svgHost') {
      this[containerName] = host;
    }

    afterUnregister(host, containerName = 'svgHost') {
      this[containerName] = null;
    }

    /* 
     * `postRemove` is called by `multi-registerable-mixin` on disconnectedCallback. 
     * It unregisters this element from svgHost. 
     */
    postRemove() {
      if (this.svgHost && this.svgHost.unregister) {
        this.svgHost.unregister(this);
      }
      super.postRemove && super.postRemove();
    }

  };
});

/*
 * @mixinFunction
 */
export default DispatchSVG;