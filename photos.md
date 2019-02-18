


<ul class="photo-gallery">
  		{% for image in site.static_files %}
			{% if image.path contains 'images' %}
    			<li>
      				<img src="{{ site.baseurl }}{{ image.path }}" alt="image" />
    			</li>
  			{% endif %}
		{% endfor %}
	</ul>
