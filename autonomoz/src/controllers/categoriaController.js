const categoriaService = require('../services/categoriaService');


class categoriaController{
async listar(req, res){
try{
const categorias = await categoriaService.listarTodos()
res.status(200).json(categorias);
}
    catch(erro){
        res.status(500).json({
            mensagem:"Erro ao buscar categorias",
            erro: erro.message });
    }
}

async buscarPorId(req, res){
    try {
        const categoria = await categoriaService.buscarPorId(req.params.id);
        res.status(200).json(categoria);

    } catch (erro) {
        res.status(404).json({
            mensagem: erro.message })
    }
}

async cadastrar(req, res){
    try {
        const resultado = await categoriaService.cadastrar(req.body);
        res.status(201).json({
            id_categoria: resultado.insertId,
            ...req.body
        });

    } catch (erro) {
        res.status(400).json({ mensagem: erro.message })
    }
}

async atualizar(req, res){
    try {
        await categoriaService.atualizar(req.params.id, req.body)
        res.status(200).json({ mensagem: "Categoria atualizada."});

    } catch (erro) {
        res.status(400).json({mensagem: erro.message})
    }
}

async excluir(req, res){
    try {
        await categoriaService.excluir(req.params.id);
        res.status(200).json({ mensagem: "Categoria removida."})

    } catch (erro) {
        res.status(400).json({mensagem: erro.message})
    }
}

}


module.exports = new categoriaController();