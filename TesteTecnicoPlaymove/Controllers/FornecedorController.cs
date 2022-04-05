using Microsoft.AspNetCore.Mvc;
using TesteTecnicoPlaymove.Entities;

namespace TesteTecnicoPlaymove.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FornecedorController : ControllerBase
    {
        private readonly ILogger<FornecedorController> _logger;

        public FornecedorController(ILogger<FornecedorController> logger)
        {
            _logger = logger;
        }

        [HttpGet("count")]
        public int GetCount()
        {       
            return new Fornecedor().GetFilteredCount(ParseFilters());
        }
    
        [HttpGet("paginated/{page}")]
        public IEnumerable<Fornecedor> Get(int page)
        {       
            return new Fornecedor().GetAllFilteredMappedAndPaginated(page, 6, ParseFilters());
        }

        [HttpGet]
        public IEnumerable<Fornecedor> Get()
        {
            return new Fornecedor().GetAllMapped().OfType<Fornecedor>();
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var fornecedor = new Fornecedor().GetById(id);

            if (fornecedor == null)
                return NotFound();

            return Ok(fornecedor);
        }

        [HttpPost]
        public IActionResult Post(Fornecedor fornecedor)
        {
            if (fornecedor.Save())
                return StatusCode(201);

            return BadRequest();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var fornecedorOnDb = (Fornecedor?)new Fornecedor().GetById(id);

            if (fornecedorOnDb?.Delete() == true)
                return NoContent();

            return BadRequest();
        }

        private FornecedorFilter ParseFilters()
        {
            var filters = new FornecedorFilter()
            {
                Nome = HttpContext.Request.Query["nome"],
                CnpjCpf = HttpContext.Request.Query["cnpjCpf"]
            };

            DateTime.TryParse(HttpContext.Request.Query["dataDeCadastroStart"], out var dataDeCadastroStart);
            filters.DataDeCadastroStart = dataDeCadastroStart;

            DateTime.TryParse(HttpContext.Request.Query["dataDeCadastroEnd"], out var dataDeCadastroEnd);
            filters.DataDeCadastroEnd = dataDeCadastroEnd;
            
            return filters;
        }

    }
}