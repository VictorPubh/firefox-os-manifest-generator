var manifest = {};
function appendToSelect(data, select) {
  var options = [];
  $.each(data, function(key, value) {
    options.push('<option value="' + key + '">' + value + '</option>');
  });
  $(options.join('')).appendTo(select);
}

$(function() {

  var locales;

  var $obj = $('#manifest-gen');

  $(window).scroll(function (event) {
    var y = $(this).scrollTop();

    if (y >= 140) {
      if(!$obj.hasClass('fixed')) {
        $obj.addClass('fixed');
      }
    } else {
      if($obj.hasClass('fixed')) {
        $obj.removeClass('fixed');
      }
    }
  });

  // carrega os idiomas
  $.getJSON('data/locales.json', function(data) {
    locales = data;
    appendToSelect(data, '#locale-default');
    appendToSelect(data, '#locale-alt');
  });

  $('body')
  .on('click', '#icon-add', function(e) {
    e.preventDefault();

    var size = $('#icon-list option:selected');
    var text = $('#icon-input');

    // verifica se tem icones para adicionar
    if(size.val() === undefined) {
      return;
    }

    // verifica se preencheu o campo
    if(text.val().length === 0) {
      alert(document.webL10n.get("required_field"));
      $(text).focus();
      return;
    }

    // removendo o item que foi selecionado
    $('#icon-list option[value="' + size.val() + '"]').remove();

    // limpando conteudo, caso não tenha nenhuma tradução
    if($('#no-translation').length) {
      $('#icon-content').html('<table class="table table-striped table-bordered"><thead><tr><th width="80">Size</th><th>URL</th><th width="45">#</th></tr></thead><tbody id="icon-size"></tbody></table>');
    }

    // incrementando a lista de icones adicionados
    $('<tr id="icon-' + size.val() + '"><td class="icon-value">' + size.val() + ' x ' + size.val() + '</td><td>' + text.val() + '</td><td><button class="btn btn-sm btn-danger" id="icon-del">-</button></td></tr>').fadeIn(400).appendTo('#icon-size');

    // limpando campos
    text.val("");

  })
  .on('click', '#icon-del', function(e) {
    e.preventDefault();

    var row = $(this).parent().parent();
    var value = row.children('.icon-value').text();

    // adicionando o item na lista
    $('<option value="' + value + '">' + value + ' x ' + value + '</option>').appendTo('#icon-list');

    // removendo o item
    $(row).fadeOut(400, function() { $(row).remove(); });
  })
  .on('click', '#locale-add', function(e) {
    e.preventDefault();

    var locale = $('#locale-alt option:selected');
    var desc = $('#locale-desc');
    var site = $('#locale-site');

    if($('#locale-default option:selected').val() == $(locale).val()) {
      alert(document.webL10n.get("language_val"));
      return;
    }

    // limpando conteudo, caso não tenha nenhuma tradução
    if($('#no-translations').length) {
      $('#locale-container').html('<table class="table table-striped table-bordered"><thead><tr><th width="80">' + document.webL10n.get('lang') + '</th><th>' + document.webL10n.get('dev_name') + '</th><th>' + document.webL10n.get('dev_site') + '</th><th width="45">#</th></tr></thead><tbody id="locale-list"></tbody></table>');
    }

    // incrementando a lista de traduções adicionados
    $('<tr><td><span data-locale="' + $(locale).val() + '">' + $(locale).text() + '</span></td><td>' + desc.val() + '</td><td>' + site.val() + '</td><td><button class="btn btn-sm btn-danger" id="locale-del">-</button></td></tr>').fadeIn(400).appendTo('#locale-list');

    // limpando os campos
    desc.val("");
    site.val("");

  })
  .on('click', '#locale-del', function(e) {
    e.preventDefault();

    var row = $(this).parent().parent();

    // removendo o item
    $(row).fadeOut(400, function() { $(row).remove(); });

  })
  .on('click', '#manifest-gen', function(e) {
    e.preventDefault();

    var version = $('#app_version');
    var app_name = $('#app_name');
    var app_desc = $('#app_desc');
    var icons = $('#icon-content tr');

    if(version.val().length == 0) {
      $(version).focus();
      alert(document.webL10n.get("version_val"));
      return;
    }

    if(app_name.val().length == 0) {
      $(app_name).focus();
      alert(document.webL10n.get("app_name_val"));
      return;
    }

    if(app_desc.val().length == 0) {
      $(app_desc).focus();
      alert(document.webL10n.get("app_desc_val"));
      return;
    }

    if(icons.size() == 0) {
      alert(document.webL10n.get("app_icons_val"));
      return;
    }

    manifest['version'] = version.val();
    manifest['name'] = app_name.val();
    manifest['description'] = app_desc.val();
    manifest['icons'] = {};

    $.each(icons, function(indexIcon, icon) {
      var iconAttr = $(icon).children('td');
      if($(iconAttr[0]).text().length > 0) {
        manifest['icons'][$(iconAttr[0]).text()] = $(iconAttr[1]).text();
      }
    });

    var developer = {};
    developer['name'] = $('#dev-name').val();
    developer['url']  = $('#dev-site').val();

    manifest['developer'] = developer;

    manifest['default_locale'] = $('#locale-default option:selected').val();

    var locales = $('#locale-list tr');
    manifest['locales'] = {};
    $.each(locales, function(indexLocales, locale) {
      var localeAttr = $(locale).children('td');
      var localeLang = $(localeAttr).children('span');
      if($(localeLang).text().length > 0) {
        var code = $(localeLang).attr('data-locale');
        manifest['locales'][code] = {};
        manifest['locales'][code]['name'] = $(localeAttr[1]).text();
        manifest['locales'][code]['url'] = $(localeAttr[2]).text();
      }
    });

    var blob = new Blob([JSON.stringify(manifest, undefined, 2)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "manifest.json");
  });
});