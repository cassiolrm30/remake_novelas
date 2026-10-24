class TabelaEditavel
{
	constructor(id)
	{
		this.Tabela;
		this.Rotulos = [];
		this.Larguras = [];
		this.Alinhamentos = [];
		this.Inputs = [];
		this.IDs = [];
		this.OpcoesCheckbox = [];
		this.QtLinhas = 0;
		this.PosicaoDaLinhaEmEdicao = -1;
		this.CorFundo = "#FFFFFF";
		this.CorFundoAlternativa = "#DDDDDD";
		this.ID = id;
		this.DadosDaLinhaEmEdicao = [];
		this.Carga = [];
	};

	getDataFormatada(valor, toDisplay)
	{
		if (valor == "") return "";
		var separador1, separador2;
		if (toDisplay)
		{
			separador1 = "-";
			separador2 = "/";
		}
		else
		{
			separador1 = "/";
			separador2 = "-";
		}
		var partesData = valor.split(separador1);
		var resultado  = partesData[2] + separador2 + partesData[1] + separador2 + partesData[0];
		return resultado;
	}

	getLinkCRUD(opcao)
	{
		var resultado = "";
		resultado += "<a href='#' onclick='{0}'>";
		resultado += "<img src='../imagens/{1}' class='linkTabelaEditavel' />";
		resultado += "</a>";
		switch (opcao)
		{
			case 1: resultado = resultado.replace("{0}", "salvarLinha(" + this.ID + ");");
					resultado = resultado.replace("{1}", "adicionar.jpg");
					break;
			case 2: resultado = resultado.replace("{0}", "editarLinha(" + this.ID + ", this.parentNode.parentNode.rowIndex);");
					resultado = resultado.replace("{1}", "editar.jpg");
					break;
			case 3: resultado = resultado.replace("{0}", "excluirLinha(" + this.ID + ", this.parentNode.parentNode.rowIndex);");
					resultado = resultado.replace("{1}", "excluir.jpg");
					break;
		}
		return resultado;
	}

	incluirLinha(dadosLinhaFiltrada)
	{
		//debugger;
		var qtColunas = this.Rotulos.length + 1;
		var dadosLinha = [];
		if (dadosLinhaFiltrada != null)
			dadosLinha = dadosLinhaFiltrada.split("|");
		else
		{
			for (var i = 0; i < qtColunas - 2; i++)
			{
				var v_input = this.Inputs[i];
				var valorCampo = "";
				if (v_input == null)
					dadosLinha.push(valorCampo);
				else
				{
					var campoEdicao = document.getElementById("campoEdicao" + this.ID + "-" + i);
					if (campoEdicao != null)
					{
						if (v_input.indexOf("type='hidden'") != -1)
							valorCampo = this.QtLinhas + "ª";
						else
						{
							if (v_input.indexOf("<select") != -1)
							{
								var itemCombo = campoEdicao;
								if (itemCombo != null)
									if (itemCombo.selectedIndex != 0)
										valorCampo = itemCombo.options[itemCombo.selectedIndex].value;
							}
							else
							{
								if (v_input.indexOf("type='date'") != -1)
								{
									valorCampo = campoEdicao.value;
									if (valorCampo != "")
										valorCampo = this.getDataFormatada(valorCampo, true);
								}
								else
								{
									if (v_input.indexOf("type='checkbox'") != -1)
										valorCampo = (campoEdicao.checked) ? this.OpcoesCheckbox[i][0] : this.OpcoesCheckbox[i][1];
									else
										valorCampo = campoEdicao.value;
								}
							}
						}
					}
					dadosLinha.push(valorCampo);
				}
			}
		}
		var posicaoLinha = this.QtLinhas;
		//debugger;
		var linha = this.Tabela.insertRow(posicaoLinha);
		linha.id = "LC" + this.ID + "-" + posicaoLinha;
		for (var i = 0; i < qtColunas; i++)
		{
			var celula = linha.insertCell(i);
			var nomeCampoEdicao = "campoEdicao" + this.ID + "-" + i;
			celula.id = "CC" + this.ID + "-" + i;
			celula.style.height = "20px";
			celula.style.border = "0px";
			celula.style.backgroundColor = (posicaoLinha % 2 == 0 ? this.CorFundo : this.CorFundoAlternativa);
			celula.style.padding = (this.Alinhamentos[i] == "left") ? "0px 5px 0px 5px" : "0px 1px 0px 1px";
			celula.style.textAlign = this.Alinhamentos[i];
			if (i < qtColunas - 2)
			{
				celula.className = "celulaConteudo";
				var v_input = this.Inputs[i];
				if (v_input == null)
					celula.innerHTML = dadosLinha[i];
				else
				{
					if (v_input.indexOf("<select") != -1)
					{
						celula.innerHTML = ((dadosLinha[i] == "") ? "" : dadosLinha[i]);
						if (document.getElementById(nomeCampoEdicao) != null)
							document.getElementById(nomeCampoEdicao).selectedIndex = 0;						
					}
					else
					{
						if (v_input.indexOf("type='checkbox'") != -1)
						{
							//celula.innerHTML = (document.getElementById(nomeCampoEdicao).checked || dadosLinha[i + 1] == "1") ? this.OpcoesCheckbox[i][0] : this.OpcoesCheckbox[i][1];
							celula.innerHTML = (document.getElementById(nomeCampoEdicao).checked || dadosLinha[i] == "1") ? this.OpcoesCheckbox[i][0] : this.OpcoesCheckbox[i][1];
							if (document.getElementById(nomeCampoEdicao) != null)
								document.getElementById(nomeCampoEdicao).checked = false;
						}
						else
						{
							//celula.innerHTML = (dadosLinhaFiltrada != null) ? dadosLinha[i + 1] : dadosLinha[i];
							celula.innerHTML = dadosLinha[i];
							if (document.getElementById(nomeCampoEdicao) != null)
								document.getElementById(nomeCampoEdicao).value = "";
						}						
					}
				}
			}
			else
			{
				celula.className   = "colunaAcoes";
				celula.style.width = (this.Larguras[this.Rotulos.length-1]/2) + "%";
				celula.innerHTML   =  this.getLinkCRUD((i == qtColunas - 2) ? 2 : 3);
			}
		}
		this.QtLinhas++;
	}

	alterarLinha(posicaoLinha)
	{
		//debugger;
		var qtColunas = this.Larguras.length + 1;
		for (var i = 0; i < qtColunas; i++)
		{
			var idCelulaCorrente = "#LC" + this.ID + "-" + posicaoLinha + " #CC" + this.ID + "-" + i;
			var nomeCampoEdicao = "campoEdicao" + this.ID + "-" + i;
			$(idCelulaCorrente).css("color", "black");
			$(idCelulaCorrente).css("backgroundColor", (posicaoLinha % 2 == 0 ? this.CorFundo : this.CorFundoAlternativa));
			if (i < qtColunas - 2)
			{
				var v_input = this.Inputs[i];
				if (v_input != null)
				{
					if (v_input.indexOf("<select") != -1)
					{
						$(idCelulaCorrente).html(document.getElementById(nomeCampoEdicao).value);
						document.getElementById(nomeCampoEdicao).value = "";
					}
					else
					{
						if (v_input.indexOf("type='date'") != -1)
						{
							//debugger;
							$(idCelulaCorrente).html(this.getDataFormatada($("#" + nomeCampoEdicao).val(), true));
							$("#" + nomeCampoEdicao).val("");
						}
						else
						{
							if (v_input.indexOf("type='checkbox'") != -1)
							{
								var v_checked = ($("#" + nomeCampoEdicao).prop("checked") ? this.OpcoesCheckbox[i][0] : this.OpcoesCheckbox[i][1]);
								$(idCelulaCorrente).html(v_checked);
								$("#" + nomeCampoEdicao).prop("checked", false);
							}
							else
							{
								$(idCelulaCorrente).html($("#" + nomeCampoEdicao).val());
								$("#" + nomeCampoEdicao).val("");
							}
						}
					}
				}
			}
			else
			{
				if (i == qtColunas - 2)
				{
					var innerHTML = $(idCelulaCorrente).html();
					innerHTML = innerHTML.replace("cancelarEdicao", "editarLinha");
					innerHTML = innerHTML.replace("cancelar.jpg", "editar.jpg");
					$(idCelulaCorrente).html(innerHTML);
				}
			}
		}
		this.PosicaoDaLinhaEmEdicao = -1;
		this.DadosDaLinhaEmEdicao = [];
	}

	editarLinha(posicaoLinha)
	{
		//debugger;
		if (this.PosicaoDaLinhaEmEdicao != -1) return;
		var qtColunas = this.Larguras.length + 1;
		var idCelulaSelecionada = "#LC" + this.ID + "-" + posicaoLinha + " #CC" + this.ID + "-" + (qtColunas - 2);
		var innerHTML = $(idCelulaSelecionada).html();
		innerHTML = innerHTML.replace("editarLinha", "cancelarEdicao");
		innerHTML = innerHTML.replace("editar.jpg", "cancelar.jpg");
		$(idCelulaSelecionada).html(innerHTML);
		for (var i = 0; i < qtColunas; i++)
		{
			var idCelulaCorrente = "#LC" + this.ID + "-" + posicaoLinha + " #CC" + this.ID + "-" + i;
			if (i < qtColunas - 2)
				this.DadosDaLinhaEmEdicao.push($(idCelulaCorrente).text());
			$(idCelulaCorrente).css("color", "white");
			$(idCelulaCorrente).css("backgroundColor", "black");
			$(idCelulaCorrente).css("verticalAlign", "middle");
			if (this.Alinhamentos[i] == "left")
				$(idCelulaCorrente).css("padding", (this.Alinhamentos[i] == "left") ? "0px 5px 0px 5px" : "0px 1px 0px 1px");
			var v_input = this.Inputs[i];
			if (v_input != null)
			{
				var nomeCampoEdicao = "#campoEdicao" + this.ID + "-" + i;
				if (v_input.indexOf("<select") != -1)
					document.getElementById(nomeCampoEdicao.replace('#', '')).value = $(idCelulaCorrente).text();
				else
				{
					if (v_input.indexOf("type='date'") != -1)
						$(nomeCampoEdicao).val(this.getDataFormatada($(idCelulaCorrente).text(), false));
					else
					{
						if (v_input.indexOf("type='checkbox'") != -1)
							$(nomeCampoEdicao).prop("checked", $(idCelulaCorrente).text() == this.OpcoesCheckbox[i][0]);
						else
							$(nomeCampoEdicao).val($(idCelulaCorrente).text());
					}
				}
			}
		}
		this.PosicaoDaLinhaEmEdicao = posicaoLinha;
	}

	cancelarEdicao(posicaoLinha)
	{
		//debugger;
		var qtColunas = this.Larguras.length + 1;
		var corFundoAtual = (posicaoLinha % 2 == 0 ? this.CorFundo : this.CorFundoAlternativa);
		for (var i = 0; i < qtColunas; i++)
		{
			var idCelulaCorrente = "#LC" + this.ID + "-" + posicaoLinha + " #CC" + this.ID + "-" + i;
			var nomeCampoEdicao = "#campoEdicao" + this.ID + "-" + i;
			$(idCelulaCorrente).css("color", "black");
			$(idCelulaCorrente).css("backgroundColor", corFundoAtual);
			if (i >= qtColunas - 2)
			{
				if (i == qtColunas - 2)
				{
					var innerHTML = $(idCelulaCorrente).html();
					innerHTML = innerHTML.replace("cancelarEdicao", "editarLinha");
					innerHTML = innerHTML.replace("cancelar.jpg", "editar.jpg");
					$(idCelulaCorrente).html(innerHTML);
				}
			}
			else
			{
				var v_input = this.Inputs[i];
				if (v_input != null)
				{
					if (v_input.indexOf("type='date'") != -1)
						$(nomeCampoEdicao).val(this.getDataFormatada($(nomeCampoEdicao).val(), true));
					else
					{
						if (v_input.indexOf("type='checkbox'") != -1)
						{
							$(idCelulaCorrente).html(this.DadosDaLinhaEmEdicao[i]);
							$(nomeCampoEdicao).prop("checked", false);
						}
						else
						{
							$(idCelulaCorrente).html(this.DadosDaLinhaEmEdicao[i]);
							if (this.Alinhamentos[i] == "left")
								$(idCelulaCorrente).css("padding", (this.Alinhamentos[i] == "left") ? "0px 5px 0px 5px" : "0px 1px 0px 1px");
							$(nomeCampoEdicao).val("");
						}
					}					
				}
			}
		}
		this.PosicaoDaLinhaEmEdicao = -1;
		this.DadosDaLinhaEmEdicao = [];
	}

	excluirLinha(posicaoLinha)
	{
		//if (confirm("Tem certeza que deseja excluir este registro?"))
		//{
		//debugger;
		var ultimaPosicaoLinha = this.Tabela.rows.length - 1;
		for (var i = posicaoLinha; i < ultimaPosicaoLinha; i++)
		{
			for (var j = 0; j <= this.Larguras.length; j++)
			{
				var idCelulaCorrenteAtual = "#LC" + this.ID + "-" + i + " #CC" + this.ID + "-" + j;
				var idCelulaCorrentePosterior = "#LC" + this.ID + "-" + (i + 1) + " #CC" + this.ID + "-" + j;
				$(idCelulaCorrenteAtual).html($(idCelulaCorrentePosterior).html());
				$(idCelulaCorrenteAtual).css("background-color", (i % 2 == 0 ? this.CorFundo : this.CorFundoAlternativa));
			}
		}
		this.Tabela.deleteRow(ultimaPosicaoLinha);
		this.QtLinhas--;
		//}
	}

	montarTabela()
	{
		$("#" + this.Tabela.id + " tr").remove(); // reinicializar a tabela

		// Primeira linha
		var linha1 = this.Tabela.insertRow(0);
		linha1.id = "LC" + this.ID + "-0";
		var qtCampos = this.Inputs.length;
		for (var i = 0; i < this.Rotulos.length; i++)
		{
			var celulaTitulo = linha1.insertCell(i);
			celulaTitulo.id = "TC" + this.ID + "-" + i;
			celulaTitulo.className = "celulaTitulo";
			celulaTitulo.innerHTML = this.Rotulos[i];
			celulaTitulo.style.width = this.Larguras[i] + "%";
			celulaTitulo.style.textAlign = (this.Alinhamentos[i] == "left") ? "left" : "center";
			celulaTitulo.style.padding = (this.Alinhamentos[i] == "left") ? "2px 5px 2px 5px" : "2px 1px 2px 1px";
			if (i == this.Rotulos.length - 1)
				celulaTitulo.colSpan = 2;
		}
		this.QtLinhas++;

		// Segunda linha
		var linha2 = this.Tabela.insertRow(1);
		linha2.id = "LC" + this.ID + "-1";
		for (var i = 0; i < qtCampos; i++)
		{
			var celula1 = linha2.insertCell(i);
			var v_innerText = this.Inputs[i];
			var v_nome_input = " id='campoEdicao" + this.ID + "-" + i + "' name='campoEdicao" + this.ID + "-" + i + "'";
			celula1.id = "CC" + this.ID + "-" + i;
			celula1.className = "coluna1";
			celula1.style.textAlign = "center";
			celula1.style.backgroundColor = "silver";
			celula1.style.paddingLeft = "5px";
			celula1.style.paddingRight = "5px";
			celula1.style.width = this.Larguras[i] + "%";
			if (v_innerText != null)
			{
				if (v_innerText.indexOf("<select") != -1)
				{
					v_innerText = v_innerText.replace("<select", "<select class='campoEdicaoSelect' ");
					v_innerText = v_innerText.replace("<select", "<select" + v_nome_input);
				}
				else
				{
					//if (v_innerText.indexOf("type='checkbox'") != -1)
					//	v_innerText = v_innerText.replace("<input ", "<input class='campoEdicaoCheckbox' ");
					//else
					//{
						v_innerText = v_innerText.replace("<input ", "<input class='campoEdicaoInput' ");
						if (v_innerText.indexOf("type='date'") != -1)
							v_innerText = v_innerText.replace("campoEdicaoInput'", "campoEdicaoInput' style='width:125px;' ");
						else
						{
							if (v_innerText.indexOf("type='number'") != -1)
								v_innerText = v_innerText.replace("campoEdicaoInput'", "campoEdicaoInput' style='width:80px;' ");
						}
					//}
					v_innerText = v_innerText.replace("<input ", "<input" + v_nome_input);
				}
			}
			celula1.innerText = v_innerText;
			celula1.innerHTML = celula1.innerText;
		}
		var celula2 = linha2.insertCell(qtCampos);
		celula2.id = "CC" + this.ID + "-" + qtCampos;
		celula2.colSpan = 2;
		celula2.className = "celulaConteudo";
		celula2.style.textAlign = "center";
		celula2.style.verticalAlign = "middle";
		celula2.style.width = this.Larguras[this.Rotulos.length-1] + "%";
		celula2.style.padding = "2px";
		celula2.style.backgroundColor = "silver";
		celula2.innerHTML = this.getLinkCRUD(1);
		this.QtLinhas++;

		// Demais linhas
		for (var i = 0; i < this.Carga.length; i++)
			this.incluirLinha(this.Carga[i]);
	}
}