export type MarkdownFile = {
  path: string;
  url: string;
  title: string;
  content: string;
};

export type TreeNode = {
  name: string;
  path: string;
  children?: TreeNode[];
  file?: MarkdownFile;
};

export function buildTree(files: MarkdownFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    let level = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const pathSoFar = parts.slice(0, index + 1).join('/');
      let node = level.find((n) => n.name === part);

      if (!node) {
        node = { name: part, path: pathSoFar };
        if (isFile) {
          node.file = file;
        } else {
          node.children = [];
        }
        level.push(node);
      } else if (isFile) {
        node.file = file;
      } else if (!node.children) {
        node.children = [];
      }

      if (!isFile && node.children) {
        level = node.children;
      }
    });
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      const aDir = Boolean(a.children);
      const bDir = Boolean(b.children);
      if (aDir !== bDir) return aDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) sortNodes(node.children);
    }
  };

  sortNodes(root);
  return root;
}
