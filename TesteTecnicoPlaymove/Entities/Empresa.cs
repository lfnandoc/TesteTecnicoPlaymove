using TesteTecnicoPlaymove.Infra;
using System.Data;
using System.Text;

namespace TesteTecnicoPlaymove.Entities
{
    public class Empresa : Entity
    {
        [Column("nomeFantasia")]
        public string? NomeFantasia { get; set; }

        [Column("cnpj")]
        public string? Cnpj { get; set; }

        [Column("uf")]
        public string? Uf { get; set; }

        public Empresa() : base()
        {
            table = "empresas";
        }

        public override void MapEntity(DataRow dataRow)
        {
            base.MapEntity(dataRow);
            NomeFantasia = dataRow["nomeFantasia"].ToString();
            Cnpj = dataRow["cnpj"].ToString();
            Uf = dataRow["UF"].ToString();
        }

        public bool HasAssociatedEntities()
        {
            if (Id == -2)
                return false;

            var query = new StringBuilder()
                .Append($"SELECT COUNT(*) FROM fornecedores")
                .Append($" WHERE empresaId = {Id}")
                .ToString();

            var result = Convert.ToInt32(new DBConnection().SelectScalar(query));

            return result > 0;
        }
    }
}
