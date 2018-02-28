import findFieldInNode from "../../src/findFieldInNode";

describe("findFieldInNode", () => {
  it("should find an input in a div", () => {
    const input = document.createElement("input");
    input.name = "foo";

    const node = document.createElement("div");
    node.appendChild(input);

    expect(findFieldInNode(node, "foo")).toEqual(input);
  });

  it("should find an input in a div several levels deep", () => {
    const input = document.createElement("input");
    input.name = "bar";

    let node = input;

    for (let i = 0; i < 10; i++) {
      const tmp = document.createElement("div");
      tmp.appendChild(node);

      node = tmp;
    }

    expect(findFieldInNode(node, "bar")).toEqual(input);
  });

  it("should return false when it cannot find an input", () => {
    expect(findFieldInNode(document.createElement("div"), "baz") === false)
      .toBeTruthy();
  });
});
