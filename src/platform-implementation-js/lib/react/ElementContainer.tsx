import React from 'react';
type Props = {
  className?: string | null | undefined;
  el: HTMLElement;
};
export default class ElementContainer extends React.Component<Props> {
  props: Props;
  _content: HTMLElement;
  _contentRefCb = (el: HTMLElement | null | undefined) => {
    if (el) this._content = el;
  };

  componentDidMount() {
    this._content.appendChild(this.props.el);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.el !== this.props.el) {
      while (this._content.lastElementChild) {
        this._content.lastElementChild.remove();
      }

      this._content.appendChild(this.props.el);
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    return (
      this.props.className !== nextProps.className ||
      this.props.el !== nextProps.el
    );
  }

  render() {
    return <div className={this.props.className} ref={this._contentRefCb} />;
  }
}
