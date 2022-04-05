using TesteTecnicoPlaymove.Infra;
using System.Data;
using System.Text;

namespace TesteTecnicoPlaymove.Entities
{

    public class FornecedorFilter
    {
        public string? Nome { get; set; }
        
        public string? CnpjCpf { get; set; }

        public DateTime DataDeCadastroStart { get; set; }

        public DateTime DataDeCadastroEnd { get; set; }
    }
    public class Fornecedor : Entity
    {
        [Column("empresaId")]
        public int EmpresaId { get; set; }

        [Column("dataDeCadastro")]
        public DateTime DataDeCadastro { get; set; }

        [Column("cpfcnpj")]
        public string? CpfOuCnpj { get; set; }

        [Column("rg")]
        public string? Rg { get; set; }

        [Column("dataDeNascimento")]
        public DateTime DataDeNascimento { get; set; }

        [Column("nome")]
        public string? Nome { get; set; }

        [Column("telefones")]
        public string? Telefones { get; set; }
        
        public Empresa? Empresa { get; set; }

        public Fornecedor() : base()
        {
            table = "fornecedores";
        }

        public override void MapEntity(DataRow dataRow)
        {
            base.MapEntity(dataRow);
            DataDeCadastro = (DateTime)dataRow["dataDeCadastro"];
            DataDeNascimento = (DateTime)dataRow["dataDeNascimento"];
            EmpresaId = Convert.ToInt32(dataRow["empresaId"]);
            Empresa = new Empresa().GetById(EmpresaId) as Empresa;
            Nome = dataRow["nome"].ToString();
            Telefones = dataRow["telefones"].ToString();
            Rg = dataRow["rg"].ToString();        
            CpfOuCnpj = dataRow["cpfcnpj"].ToString();
        }

        public IEnumerable<Fornecedor> GetAllFilteredMappedAndPaginated(int currentPage, int itemsPerPage, FornecedorFilter filters)
        {
            var offset = (currentPage * itemsPerPage) - (itemsPerPage);
            var limit = (itemsPerPage);
            var query = new StringBuilder()
                .Append($"SELECT * FROM {table}")
                .Append(GetFiltersSQL(filters))
                .Append($" LIMIT {limit} OFFSET {offset} ");

            var result = new DBConnection().Select(query.ToString()).Rows;

            foreach (DataRow dataRow in result)
            {
                var fornecedor = new Fornecedor();
                fornecedor.MapEntity(dataRow);

                if (fornecedor != null)
                    yield return fornecedor;
            }
        }

        public int GetFilteredCount(FornecedorFilter filters)
        {
            var query = new StringBuilder()
                .Append($"SELECT COUNT(*) FROM {table}")
                .Append(GetFiltersSQL(filters));

            var result = new DBConnection().SelectScalar(query.ToString());

            return Convert.ToInt32(result);
        }

        public string GetFiltersSQL(FornecedorFilter filters)
        {
            var sql = new StringBuilder();
            sql.Append(" WHERE 1=1 ");

            if (filters.Nome != null)
            {
                sql.Append($" AND nome LIKE '%{ReplaceQuotes(filters.Nome)}%'");
            }

            if (filters.CnpjCpf != null)
            {
                sql.Append($" AND cpfcnpj LIKE '%{ReplaceQuotes(filters.CnpjCpf)}%'");
            }

            if (filters.DataDeCadastroStart != DateTime.MinValue && filters.DataDeCadastroEnd != DateTime.MinValue)
            {
                sql.Append($" AND (dataDeCadastro BETWEEN '{filters.DataDeCadastroStart.ToString("yyyy-MM-dd 00:00:00")}' AND '{filters.DataDeCadastroEnd.ToString("yyyy-MM-dd 23:59:59")}')");
            }

            return sql.ToString();
        }
        
    }
}
