var post = {};

post.copyHeaderLink = (e) => {
	e.preventDefault();

  window.getSelection().removeAllRanges();
  var range = document.createRange();
  range.selectNode(e.currentTarget.querySelector(".post-header-link-hash"));
  window.getSelection().addRange(range);  

  try {
    var successful = document.execCommand('copy');
    post.feedbackLinkCopied(e.target, "✓");
  } catch(err) {
    post.feedbackLinkCopied(e.target, "Error");
  }

  window.getSelection().removeAllRanges();
}

post.feedbackLinkCopied = (target, feedback) => {
	var label = target.querySelector(".post-header-link-label");
	var text = label.textContent;
	label.textContent = feedback;
	// Reset to original copy after leaving the hit target
	target.addEventListener("mouseleave", () => label.textContent = text);
}

app.ready(() => {
	// Add links to headers
  const headers = select(".article").querySelectorAll("h1, h2, h3, h4, h5, h6");
	headers.forEach(header => {
		const fullHref = window.location.origin + window.location.pathname + "#" + header.id;
		const headerLink = create("a.post-header-link", "#", { href: "#" + header.id },
			create("span.post-header-link-label", "Copy"),
			create("span.post-header-link-hash", fullHref)
		);

		headerLink.addEventListener("click", post.copyHeaderLink);
		header.appendChild(headerLink);
	});
});
