var URL = "http://localhost:1234/";
var v_qt_registros_por_pagina = 5;
var v_ascii_inicio = 65;
var v_ascii_fim = 218;
var listagem = [];
var tabela, rotulos = [], larguras = [], aligns = [];
var v_qt_linhas = 1;
var sentidosAscendente = [];
var v_ascii_atual = 1;
var v_pagina_atual = 1;
var v_unicode_anterior;
var v_unicode_atual;

function MontarBarraNavegacao()
{
	var resultado = "";
	resultado += "<nav class='navbar navbar-inverse' style='padding:0px 100px 0px 0px;text-align:center;border-radius:0px;margin-top:-50px;'>";
	resultado += "<ul class='nav navbar-nav' style='width:100%;'>";
	resultado += "<li style='width:15%;'><a href='index.html'>Principal</a></li>";
	resultado += "<li style='width:7%;'><a href='Autores/listagem.html'>Autores</a></li>";
	resultado += "<li style='width:8%;'><a href='Novelas/listagem.html'>Novelas</a></li>";
	resultado += "<li style='width:7%;'><a href='Atores/listagem.html'>Atores</a></li>";
	resultado += "<li style='width:15%;'><a href='Atores/importacao_dados_elenco.html'>Importa&ccedil;&atilde;o de Dados</a></li>";
	resultado += "<li style='width:15%;'><a href='Novelas/definicao_prioridades.html'>Defini&ccedil;&atilde;o de Prioridades</a></li>";
	resultado += "<li style='width:15%;'><a href='Novelas/elenco_remakes.html' onclick='ReiniciarLocalStorage();'>Elenco para Remakes</a></li>";
	resultado += "<li style='width:9%;'><a href='wikipedia_ator_autor.html'>Wikipedia</a></li>";
	resultado += "<li style='width:9%;'><a href='dashboard.html'>Dashboard</a></li>";
	resultado += "</ul>";
	resultado += "</nav>";
	$("#divNav").html(resultado);
}

function ReiniciarLocalStorage()
{
	localStorage.removeItem("novelaId");	
}

function MontarRodape()
{
	var resultado = "";
	resultado += "<div style='margin-top:-20px;height:40px;'>";
	resultado += "<hr />";
	resultado += "<footer><p>&copy; 2021 - Sistema de Remake de Novelas</p></footer>";
	resultado += "</div>";
	$("#divRodape").html(resultado);
}

/*
function getNovelas()
{
	var resultado = [];
	jQuery.ajax
	({
		type: "get",
		dataType: "json",
		url: URL + "novela",
		async: false,
		success: function(data)
		{
			for (var i = 0; i < data.length; i++)
				resultado.push( { "Id": data[i].id, "Titulo": data[i].titulo.toUpperCase(), "AutorOriginal": data[i].autorOriginal, "AutorAtual": data[i].autorAtual } );
		},
		error: function(data) { },
	});
	novelas = novelas.sort((a, b) => { if (a.titulo <= b.titulo) { return -1; }});
	for (let i = 0; i < novelas.length; i++)
		resultado.push( { "Id": novelas[i].id, "Titulo": novelas[i].titulo.toUpperCase(), "AutorOriginal": novelas[i].autorOriginal, "AutorAtual": novelas[i].autorAtual } );
	return resultado;
}

function getAtores()
{
	var resultado = [];
	jQuery.ajax
	({
		type: "GET",
		dataType: "json",
		url: URL + "ator",
		async: false,
		success: function (data)
		{
			for (var i = 0; i < data.length; i++)
				resultado.push({ "Id": data[i].id, "Nome": data[i].nomeArtistico.toUpperCase(), "ImagemFoto": data[i].imagemFoto });
		},
		error: function (data) { },
	});
	atores = atores.sort((a, b) => { if (a.nomeArtistico <= b.nomeArtistico) { return -1; }});
	for (let i = 0; i < atores.length; i++)
		resultado.push({ "Id": atores[i].id, "Nome": atores[i].nomeArtistico.toUpperCase(), "ImagemFoto": atores[i].imagemFoto });
	return resultado;
}

function excluir(id, opcaoTela)
{
	if (confirm("Tem certeza que deseja excluir este registro?"))
	{
		var resultado = "";
		var opcaoController = "";
		switch (opcaoTela)
		{
			case 1: opcaoController = "autor"; 	dados = getAutores(); break;
			case 2: opcaoController = "novela";	dados = getNovelas(); break;
			case 3: opcaoController = "ator";	dados = getAtores();  break;
        }
		jQuery.ajax
		({
			type: "DELETE",
			contentType: "json",
			url: URL + opcaoController + "/excluir/" + id,
			async: false,
			success: function (data, status)
			{
				debugger;
				if (status == "success")
				{
					for (var i = 0; i < dados.length; i++)
					{
						if (dados[i].Id == id) { dados.splice(i, 1); break; }
					}
					if (dados.length > 0)
					{
						var v_unicode = document.getElementsByClassName("aba selected")[0].id.replace("aba", "");
						var v_unicodes_acentos = [];
						switch (parseInt(v_unicode))	// vogais com acentos
						{
							case 65:
							case 192:
							case 193:
							case 194: v_unicode = "65"; v_unicodes_acentos = [65, 192, 193, 194]; break;
							case 69:
							case 201:
							case 202: v_unicode = "69"; v_unicodes_acentos = [69, 201, 202]; break;
							case 73:
							case 205: v_unicode = "73"; v_unicodes_acentos = [73, 205]; 	 break;
							case 79:
							case 211:
							case 212: v_unicode = "79"; v_unicodes_acentos = [79, 211, 212]; break;
							case 85:
							case 218: v_unicode = "85"; v_unicodes_acentos = [85, 218]; 	 break;
							default:  v_unicodes_acentos = [parseInt(v_unicode)]; 	 	 	 break;
						}
						// no caso de não haver mais registros com a inicial selecionada, remove-se a aba corrente e seleciona-se a primeira aba à esquerda
						if (dados.filter(function (item) 
										 {
											return v_unicodes_acentos.includes(parseInt(item.Nome == null ? item.Titulo.charCodeAt(0) : item.Nome.charCodeAt(0)));
										 }).length == 0)
						{
							$("#aba" + v_unicode).remove();
							v_unicode = document.getElementsByClassName("aba")[0].id.replace("aba", "");
						}
						else
							$(".aba").removeClass("selected");

						v_qt_linhas = 1;
						$("#aba" + v_unicode).addClass("selected");
						tabela = document.getElementById($("#content table").prop("id"));
						montarTabela(opcaoTela, parseInt(v_unicode));
						resultado = "Dados excluídos com sucesso.";
					}
				}
			},
			error: function (e)
			{
				console.log(e);
				resultado = e.responseText;
			},
		});
		alert(resultado);
	}
}
*/

function getNovelas()
{
	var resultado = [];
	novelas = novelas.sort((a, b) => { if (a.titulo <= b.titulo) { return -1; }});
	for (let i = 0; i < novelas.length; i++)
	{
		let _versoesNovelas = versoesNovelas.filter((v) => v.versaoOriginalId == novelas[i].id).sort(function(v1, v2) { return (new Date(v1.dataLancamento)) - (new Date(v2.dataLancamento)); });
		let _autor = autores.filter((a) => a.id == _versoesNovelas[0].autorId);
		let autorOriginal   = _autor[0].nomeArtistico.toUpperCase();
		let autorAtual 		= "-";
		if (_versoesNovelas.length > 1)
		{
			_autor = autores.filter((a) => a.id == versoesNovelas[_versoesNovelas.length-1].autorId);
			autorAtual = _autor[0].nomeArtistico.toUpperCase();
		}		
		resultado.push( { "Id": novelas[i].id, "Titulo": novelas[i].titulo.toUpperCase(), "AutorOriginal": autorOriginal, "AutorAtual": autorAtual } );
	}
	return resultado;
}

function getAtores()
{
	var resultado = [];
	atores = atores.sort((a, b) => { if (a.nomeArtistico <= b.nomeArtistico) { return -1; }});
	for (let i = 0; i < atores.length; i++)
		resultado.push({ "Id": atores[i].id, "Nome": atores[i].nomeArtistico.toUpperCase(), "ImagemFoto": atores[i].imagemFoto });
	return resultado;
}

function getVersoesNovelas(opcao, id)
{
	var resultado = [];
	let _versoesNovelas;
	if (opcao == "A")	// Autor
	{
		_versoesNovelas = versoesNovelas.filter((v) => v.autorId == id).sort((a, b) => { if ((new Date(a.dataLancamento)) <= (new Date(b.dataLancamento))) { return -1; }});
		for (let i = 0; i < _versoesNovelas.length; i++)
		{
			let _novela = novelas.filter((n) => n.id == _versoesNovelas[i].versaoOriginalId);
			var tituloNovela = (_novela[0] == null) ? "" : _novela[0].titulo.toUpperCase();
			resultado.push({ "id": _versoesNovelas[i].id, "tituloNovela": tituloNovela, "anoLancamento": (new Date(_versoesNovelas[i].dataLancamento)).getFullYear() });
		}
	}
	else				// Novela
	{
		_versoesNovelas = versoesNovelas.filter((v) => v.versaoOriginalId == id).sort((a, b) => { if ((new Date(a.dataLancamento)) <= (new Date(b.dataLancamento))) { return -1; }});
		resultado = _versoesNovelas;
	}
	return resultado;
}

function getPersonagens(opcao, id)
{
	var resultado = [];
	let _personagens;
	if (opcao == "A") 	// Ator
	{
		_personagens = personagens.filter((v) => v.atorId == id).sort((a, b) => { if (a.nome <= b.nome) { return -1; }});
	}
	else				// Novela
	{
		_personagens = personagens.filter((p) => p.novelaId == id).sort((a, b) => { if (a.id <= b.id) { return -1; }});
	}
	resultado = _personagens;
	return resultado;
}

function getNovelasComPersonagens()
{
	var resultado = [];
	for (let i = 0; i < novelas.length; i++)
	{
		novelas[i].personagens = getPersonagens("N", novelas[i].id);
		if (novelas[i].personagens.length > 0)
			resultado.push({ "id": novelas[i].id, "titulo": novelas[i].titulo });
	}
	resultado = resultado.sort((a, b) => { if (a.titulo <= b.titulo) { return -1; }});
	return resultado;
}

function montarAbasPorLetraInicial()
{
	var resultado = "";
	resultado += "<ul class='abas' type='none'>";
	for (var i = v_ascii_inicio; i <= v_ascii_fim; i++)
	{
		if (listagem.dados.filter(function (item)
						 {
							let unicodeDaLetraInicial = (item.Nome == null ? item.Titulo : item.Nome).charCodeAt(0);
							switch (unicodeDaLetraInicial)	// vogais com acentos
							{
								case 65:
								case 192:
								case 193:
								case 194: unicodeDaLetraInicial = 65; break;
								case 69:
								case 201:
								case 202: unicodeDaLetraInicial = 69; break;
								case 73:
								case 205: unicodeDaLetraInicial = 73; break;
								case 79:
								case 211:
								case 212: unicodeDaLetraInicial = 79; break;
								case 85:
								case 218: unicodeDaLetraInicial = 85; break;
							}
							return i == unicodeDaLetraInicial;
						 }).length > 0)
			resultado += "<li><div class='aba' id='aba" + i + "'><span>" + String.fromCharCode(i) + "</span></div></li>";
	}
	resultado += "</ul>";
	$("#header").html(resultado);
}

function montarTabela(p_opcao_tela, p_unicode)
{
	$("#tblListagem tr").remove(); // reinicializar a tabela
	var linha = tabela.insertRow(0);
	// Definindo o título da cada coluna da tabela
	for (var i = 0; i < rotulos.length; i++)
	{
		var celulaTitulo = linha.insertCell(i);
		celulaTitulo.id = "T" + (i+1);
		celulaTitulo.className = (i == (rotulos.length-1))? "celulaAcoes" : "celulaTitulo";
		celulaTitulo.innerHTML = rotulos[i];
		celulaTitulo.style.width = larguras[i];
		celulaTitulo.style.textAlign = aligns[i];
		if (celulaTitulo.style.textAlign == "left")
			celulaTitulo.style.paddingLeft = "5px";
		if (celulaTitulo.style.textAlign == "right")
			celulaTitulo.style.paddingRight = "5px";
	}
	$(".celulaTitulo").click(function () { sortTable(this.cellIndex); });

	// Definindo o corpo da tabela
	var dados_filtrados = listagem.dados.filter(function (item)
									   {
											var filtro = (item.Nome == null ? item.Titulo.charCodeAt(0) : item.Nome.charCodeAt(0))
											switch (p_unicode)	// vogais com acentos
											{
												case 65:
												case 192:
												case 193:
												case 194: return [65, 192, 193, 194].includes(filtro);
												case 69:
												case 201:
												case 202: return [69, 201, 202].includes(filtro);
												case 73:
												case 205: return [73, 205].includes(filtro);
												case 79:
												case 211:
												case 212: return [79, 211, 212].includes(filtro);
												case 85:
												case 218: return [85, 218].includes(filtro);
												default: return p_unicode == filtro;
											}
									   });
	var v_qt_paginas    = (listagem.dados.length / v_qt_registros_por_pagina).toFixed(0);
	debugger;
	if (v_unicode_anterior != v_unicode_atual)
	{
		v_pagina_atual = 1;
		v_unicode_anterior = v_unicode_atual;
	}
	var pagina_inicio   = (v_pagina_atual - 1) * v_qt_registros_por_pagina;
	var pagina_fim      = pagina_inicio + v_qt_registros_por_pagina;
	var dadosPaginados  = dados_filtrados.slice(pagina_inicio, pagina_fim);
	for (var i = 0; i < dadosPaginados.length; i++)
	{
		var celulas = [];
		var linkEditar = "<a href='#' onclick=editar('" + dadosPaginados[i].Id + "');><img src='../imagens/editar.jpg' /></a>";
		var linkExcluir = "<a href='#' onclick=excluir('" + dadosPaginados[i].Id + "', " + p_opcao_tela + ");><img src='../imagens/excluir.jpg' /></a>";
		switch (p_opcao_tela)
		{
			// Tela de autores
			case 1:	if (dadosPaginados[i].ImagemFoto == null)
						celulas.push("<img src='../imagens/SEM_FOTO.jpg' style='height:20px;width:17.2px;' />|center");
					else
						celulas.push("<a href='#'><img src='" + dadosPaginados[i].ImagemFoto + "' style='height:20px;width:17.2px;cursor:pointer;' /></a>|center");
					celulas.push(dadosPaginados[i].Nome + "|left");
					celulas.push(linkEditar + "&nbsp;&nbsp;" + linkExcluir + "|center");
					break;
			// Tela de novelas
			case 2: var linkRemake = "<a href='#' onclick='criarRemake(" + dadosPaginados[i].Id + ");'><img src='../imagens/remake.jpg' /></a>";
					celulas.push(dadosPaginados[i].Titulo + "|left");
					celulas.push(dadosPaginados[i].AutorOriginal + "|left");
					celulas.push((dadosPaginados[i].AutorAtual == null ? "-" : dadosPaginados[i].AutorAtual) + "|left");
					celulas.push(linkRemake + "&nbsp;&nbsp;" + linkEditar + "&nbsp;&nbsp;" + linkExcluir + "|center");
					break;
			// Tela de atores
			case 3:	if (dadosPaginados[i].ImagemFoto == null)
						celulas.push("<img src='../imagens/SEM_FOTO.jpg' style='height:20px;width:17.2px;' />|center");
					else
						celulas.push("<a href='#'><img src='" + dadosPaginados[i].ImagemFoto + "' style='height:20px;width:17.2px;cursor:pointer;' /></a>|center");
					celulas.push(dadosPaginados[i].Nome + "|left");
					celulas.push(linkEditar + "&nbsp;&nbsp;" + linkExcluir + "|center");
					break;
		}
		adicionarLinha(celulas);
	}

	// Definindo a linha da paginação
	var linha = tabela.insertRow(dadosPaginados.length+1);
	var celula = linha.insertCell(0);
	celula.className = "paginacao";
	$("td.paginacao").prop("colspan", rotulos.length);
	
	var paginacao = "";
	var v_qt_paginas = Math.trunc(dados_filtrados.length / v_qt_registros_por_pagina);
	var v_resto  = (dados_filtrados.length % v_qt_registros_por_pagina) != 0 ? 1 : 0;
	v_qt_paginas += v_resto;
	if (v_qt_paginas <= 1)
		paginacao += "<span style='padding:6px;'></span>";
	else
	{
		for (var i = 1; i <= v_qt_paginas; i++)
		{
			if (i == v_pagina_atual)
				paginacao += "<span class='pagina_atual'>" + v_pagina_atual + "</span>";
			else
			{
				v_qt_linhas = 1;
				paginacao += "<a href='#' onclick='v_pagina_atual = " + i + ";montarTabela(" + p_opcao_tela + ", " + p_unicode + ");'>" + i + "</a>";
			}
		}
	}
	$("td.paginacao").html(paginacao);
}

function adicionarLinha(celulas)
{
	var linha = tabela.insertRow(v_qt_linhas);
	var conteudo = celulas;
	for (var i = 0; i < conteudo.length; i++)
	{
		var dadosConteudo = conteudo[i].split('|');
		var celula = linha.insertCell(i);
		celula.id = "C" + v_qt_linhas + (i+1);
		celula.className = "celulaConteudo";
		celula.innerHTML = dadosConteudo[0];
		celula.style.textAlign = dadosConteudo[1];
		if (celula.style.textAlign == "left")
			celula.style.paddingLeft = "5px";
		if (celula.style.textAlign == "right")
			celula.style.paddingRight = "5px";
	}
	v_qt_linhas++;
}

function montarAbasListagemNovelas()
{
	/*
	Códigos Decimais ASCII:
	192 - "À"
	193 - "Á"
	194 - "Â"
	201 - "É"
	202 - "Ê"
	205 - "Í"
	211 - "Ó"
	212 - "Ô"
	218 - "Ú"
	*/
	var resultado = "";
	resultado += "<ul class='abas' type='none'>";
	for (var i = v_ascii_inicio; i <= v_ascii_fim; i++)
	{
		if (i <= 90 || i == 192 || i == 193 || i == 194 || i == 201 || i == 202 || i == 205 || i == 211 || i == 212 || i == 218)
		{
			if (listagem.dados.filter(function (item) { return item.Titulo.substring(0, 1) == String.fromCharCode(i); }).length > 0)
				resultado += "<li><div class='aba' id='aba" + i + "'><span>" + String.fromCharCode(i) + "</span></div></li>";
		}
	}
	resultado += "</ul>";
	$("#header").html(resultado);
}

function montarAbasWikipedia()
{
	var resultado = "";
	resultado += "<ul class='abas' type='none'>";
	resultado += "	<li><div class='aba' style='height:25px;width:200px;padding:2px 0px 0px 0px;font-size:13px;' id='abaBiografia'><span>Biografia</span></div></li>";
	resultado += "	<li><div class='aba' style='height:25px;width:200px;padding:2px 0px 0px 0px;font-size:13px;' id='abaFilmografia'><span>Filmografia - Televis&atilde;o</span></div></li>";
	resultado += "</ul>";
	$("#header").html(resultado);
}

function sortTable(coluna)
{
	var rows, switching, i, x, y, shouldSwitch;
	var switching = true;
	// Prosseguir até que nenhuma troca seja feita
	while (switching)
	{
		// Começar dizendo: nenhuma troca é feita
		switching = false;
		rows = tabela.rows;
		// Loop por todas as linhas da tabela (exceto a linha de cabeçalhos e de paginaçao)
		for (i = 1; i < (rows.length - 2); i++)
		{
			shouldSwitch = false;
			if (sentidosAscendente[coluna])
			{
				x = rows[i].getElementsByTagName("TD")[coluna];
				y = rows[i + 1].getElementsByTagName("TD")[coluna];			
			}
			else
			{
				y = rows[i].getElementsByTagName("TD")[coluna];
				x = rows[i + 1].getElementsByTagName("TD")[coluna];
			}
			if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase())
			{
				// Em caso afirmativo, marcar a troca e interromper o ciclo
				shouldSwitch = true;
				break;
			}
		}
		if (shouldSwitch)
		{
			// realizar e marcar a troca
			rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
			switching = true;
		}
	}
	sentidosAscendente[coluna] = !(sentidosAscendente[coluna]);
}

function getParametros()
{
	var query = location.search.slice(1);
	var partes = query.split('&');
	var parametros = {};
	var resultado = [];
	partes.forEach(function (parte)
	{
		var chaveValor = parte.split('=');
		var chave = chaveValor[0];
		var valor = chaveValor[1];
		parametros[chave] = valor;
		resultado.push(parametros[chave]);
	});
	return resultado;
}

function editar(id)
{
	//localStorage.setItem("Id", id);
	window.location.href = "cadastro.html?Id=" + id;
}

function excluir(id, opcaoTela)
{
	if (confirm("Tem certeza que deseja excluir este registro?"))
	{
		var resultado = "";
		if (true) // se a exclusão foi sucessiva
		{
			for (var i = 0; i < listagem.dados.length; i++)
			{
				if (listagem.dados[i].Id == id)
				{
					listagem.dados.splice(i, 1);		
					break;
				}
			}
			if (listagem.dados.length > 0)
			{
				var v_unicode = document.getElementsByClassName("aba selected")[0].id.replace("aba", "");
				var v_unicodes_acentos = [];
				switch (parseInt(v_unicode))	// vogais com acentos
				{
					case 65:
					case 192:
					case 193:
					case 194: v_unicode = "65"; v_unicodes_acentos = [65, 192, 193, 194]; break;
					case 69:
					case 201:
					case 202: v_unicode = "69"; v_unicodes_acentos = [69, 201, 202]; break;
					case 73:
					case 205: v_unicode = "73"; v_unicodes_acentos = [73, 205]; 	 break;
					case 79:
					case 211:
					case 212: v_unicode = "79"; v_unicodes_acentos = [79, 211, 212]; break;
					case 85:
					case 218: v_unicode = "85"; v_unicodes_acentos = [85, 218]; 	 break;
					default:  v_unicodes_acentos = [parseInt(v_unicode)]; 	 	 	 break;
				}
				// no caso de não haver mais registros com a inicial selecionada, remove-se a aba corrente e seleciona-se a primeira aba à esquerda
				if (listagem.dados.filter(function (item) 
								 {
									return v_unicodes_acentos.includes(parseInt(item.Nome == null ? item.Titulo.charCodeAt(0) : item.Nome.charCodeAt(0)));
								 }).length == 0)
				{
					$("#aba" + v_unicode).remove();
					v_unicode = document.getElementsByClassName("aba")[0].id.replace("aba", "");
				}
				else
					$(".aba").removeClass("selected");

				v_qt_linhas = 1;
				$("#aba" + v_unicode).addClass("selected");
				tabela = document.getElementById($("#content table").prop("id"));
				montarTabela(opcaoTela, parseInt(v_unicode));
				resultado = "Dados excluídos com sucesso.";
			}
		}

		alert(resultado);
	}
}

function replaceAll(palavraOuFrase, antes, depois)
{
	while (palavraOuFrase.indexOf(antes) != -1)
		palavraOuFrase = palavraOuFrase.replace(antes, depois);
	return palavraOuFrase;
}

function GETENUMS()
{
	let resultado = { "dados": null, "mensagem": null };
	jQuery.ajax
	({
		type: "GET",
		dataType: "json",
		url: URL + "pessoa/enums",
		async: false,
		success: function (data)
		{
			resultado = { "dados": data, "mensagem": data.message };
		},
		error: function (e)
		{
			console.log(e);
			debugger;
			resultado = { "dados": e, "mensagem": "ERRO INTERNO:\n" + e.message };
		}
	});
	return resultado;
}

$(document).ready(function ()
{
	MontarBarraNavegacao();
	MontarRodape();
});