import type GmailComposeView from '../gmail-compose-view';
export default function positionFormattingToolbar(
  gmailComposeView: GmailComposeView
) {
  const formattingToolbar = gmailComposeView.getFormattingToolbar();

  if (formattingToolbar && formattingToolbar.style.display === '') {
    const arrowElement = gmailComposeView.getFormattingToolbarArrow();
    const buttonElement = gmailComposeView.getFormattingToolbarToggleButton();
    const left =
      buttonElement.offsetLeft +
      buttonElement.clientWidth / 2 -
      arrowElement.offsetWidth / 2;
    arrowElement.style.left = left + 'px';
    const statusBarPrependContainer =
      gmailComposeView.getStatusBarPrependContainer();

    if (statusBarPrependContainer) {
      formattingToolbar.style.bottom =
        -1 * statusBarPrependContainer.offsetHeight + 'px';
    } else {
      formattingToolbar.style.bottom = '';
    }
  }
}
