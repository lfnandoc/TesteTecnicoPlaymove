using Microsoft.AspNetCore.Mvc;
using TesteTecnicoPlaymove.Entities;

namespace TesteTecnicoPlaymove.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class EmpresaController : ControllerBase
    {
        private readonly ILogger<EmpresaController> _logger;

        public EmpresaController(ILogger<EmpresaController> logger)
        {
            _logger = logger;
        }

        [HttpGet("count")]
        public int GetCount()
        {
            return new Empresa().GetEntityCount();
        }

    
        [HttpGet("paginated/{page}")]
        public IEnumerable<Empresa> Get(int page)
        {
            return new Empresa().GetAllMappedAndPaginated(page, 6).OfType<Empresa>();
        }

        [HttpGet]
        public IEnumerable<Empresa> Get()
        {
            return new Empresa().GetAllMapped().OfType<Empresa>();
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var empresa = new Empresa().GetById(id);

            if (empresa == null)
                return NotFound();

            return Ok(empresa);
        }

        [HttpPost]
        public IActionResult Post(Empresa empresa)
        {
            if (empresa.Save())
                return StatusCode(201);

            return BadRequest();
        }


        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var empresaOnDb = (Empresa?)new Empresa().GetById(id);

            if (empresaOnDb?.HasAssociatedEntities() == true)
                return StatusCode(501);
            
            if (empresaOnDb?.Delete() == true)
                return NoContent();

            return BadRequest();
        }

    }
}