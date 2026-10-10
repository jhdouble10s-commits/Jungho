import {
  Node,
  mergeAttributes
} from "./chunk-SQB3THMU.js";
import "./chunk-TU7O2H4E.js";
import "./chunk-XCBH6NLF.js";

// node_modules/@tiptap/extension-table-row/dist/index.js
var TableRow = Node.create({
  name: "tableRow",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  content: "(tableCell | tableHeader)*",
  tableRole: "row",
  parseHTML() {
    return [
      { tag: "tr" }
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["tr", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  }
});
export {
  TableRow,
  TableRow as default
};
