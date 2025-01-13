class TurnCounter {
  constructor(
    public value: number,
    public prefix: string = "",
    public suffix = ""
  ) {
    dojo.place(
      `<div id='LSU_turnCounter'>${this.getFullString()}</div>`,
      "synchronous_notif_icon",
      "before"
    );
  }

  toValue(newValue: number) {
    this.value = newValue;
    $("LSU_turnCounter").innerText = this.getFullString();
  }

  getFullString() {
    return this.prefix + this.value + this.suffix;
  }
}
