import styles from "./Accounts.module.css";

export function ClientForm({ formValues, handleChange, profile_names, client_handlers }) {
    return (
        <div className={styles.formcontainer1}>
            <div className={styles.formContainer}>
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>order date</legend>
                    <input 
                        name="order_date" 
                        value={formValues.order_date} 
                        onChange={handleChange} 
                        placeholder="select date" 
                        type="date"
                    />
                </fieldset>
                {/* Client ID */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Client ID</legend>
                    <input 
                        name="client_id" 
                        value={formValues.client_id} 
                        onChange={handleChange} 
                        placeholder="Ex: 101" 
                    />
                </fieldset>

                {/* reference id */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Reference ID</legend>
                    <input 
                        name="reference_id" 
                        value={formValues.reference_id} 
                        onChange={handleChange} 
                        placeholder="Ex: 101" 
                    />
                </fieldset>

                {/* Client Name */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Client Name</legend>
                    <input 
                        name="client_name" 
                        value={formValues.client_name} 
                        onChange={handleChange} 
                        placeholder="Enter Name" 
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
    <legend className={styles.inputLegend}>profile name</legend>
    <select 
        name="profile_name" 
        value={formValues.profile_name} 
        onChange={handleChange}
        className={styles.selectInput}
    >
        <option value="" disabled>Select a Client</option>
        {profile_names && profile_names.map((name, index) => (
            <option key={index} value={name}>{name}</option>
        ))}
    </select>
</fieldset>

                {/* Location */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Country</legend>
                    <input 
                        name="location" 
                        value={formValues.location} 
                        onChange={handleChange} 
                        placeholder="Country" 
                    />
                </fieldset>

                {/* Email */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Email</legend>
                    <input 
                        name="email" 
                        value={formValues.email} 
                        onChange={handleChange} 
                        placeholder="example@gmail.com" 
                    />
                </fieldset>

                {/* Whatsapp */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Whatsapp</legend>
                    <input 
                        name="whatsapp" 
                        value={formValues.whatsapp} 
                        onChange={handleChange} 
                        placeholder="+91..." 
                    />
                </fieldset>
            </div>

            <div className={styles.formContainer}>
                 

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Writing Start Date</legend>
                    <input 
                        name="writing_start_date" 
                        value={formValues.writing_start_date} 
                        onChange={handleChange} 
                        type="date"
                    />
                </fieldset>
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>publish Start Date</legend>
                    <input 
                        name="publish_start_date" 
                        value={formValues.publish_start_date} 
                        onChange={handleChange} 
                        type="date"
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Client Drive </legend>
                    <input 
                        name="client_drive_link" 
                        value={formValues.client_drive_link} 
                        onChange={handleChange} 
                        placeholder="paste your link"
                        type="url"
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Title</legend>
                    <input 
                        name="title" 
                        value={formValues.title} 
                        onChange={handleChange} 
                        placeholder="EX: AI......" 
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
    <legend className={styles.inputLegend}>Client Handler</legend>
    <select 
        name="client_handler" 
        value={formValues.client_handler} 
        onChange={handleChange}
        className={styles.selectInput}
    >
        <option value="" disabled>Assigned To</option>
        {client_handlers && client_handlers.map((handler, index) => (
            <option key={index} value={handler}>{handler}</option>
        ))}
    </select>
</fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Client Ref no</legend>
                    <input 
                        name="client_ref_no" 
                        value={formValues.client_ref_no} 
                        onChange={handleChange} 
                        placeholder="EX: REF-001" 
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Order Type</legend>
                    <select 
                        name="order_type" 
                        value={formValues.order_type} 
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                        <option value="" disabled>Select an option</option>
                        <option value="WO/PO">WO / PO</option>
                        <option value="MO/PO">MO / PO</option>
                        <option value="WO">WO</option>
                        <option value="PO">PO</option>
                        <option value="MO/RV">MO/RV</option>
                        <option value="MO">MO</option>
                        <option value="Thesis writing">Thesis writing</option>
                        <option value="WO/Implementation/PO">WO/ Implementation/PO</option>
                        <option value="Review paper writing">Review paper writing</option>
                        <option value="WO/Conference">WO/Conference</option>
                        <option value="Improvement">Improvement</option>
                    </select>
                </fieldset>
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Journal</legend>
                    <textarea 
                        name="journal" 
                        value={formValues.journal} 
                        className={styles.textAreaInput}
                        onChange={handleChange} 
                        placeholder="Enter full journal name..." 
                        
                    />
                </fieldset>
            </div>

            <div className={styles.formContainer}>
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Index</legend>
                    <select 
                        name="index_option" 
                        value={formValues.index_option} 
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                       <option value="" disabled>Select Indexing</option>
                        <option value="SCI">SCI</option>
                        <option value="Scopus">Scopus</option>
                        <option value="SSCI">SSCI</option>
                        <option value="EI">EI</option>
                        <option value="Scopus & SCI">Scopus & SCI</option>
                        <option value="SCIE">SCIE</option>
                    </select>
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Rank</legend>
                    <select 
                        name="cli_rank" 
                        value={formValues.cli_rank} 
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                       <option value="" disabled>Choose Rank</option>
                        <option value="Q1">Q1</option>
                        <option value="Q2">Q2</option>
                        <option value="Q3">Q3</option>
                        <option value="Q4">Q4</option>
                        <option value="Anything">Anything</option>
                        <option value="Q1 or Q2">Q1 or Q2</option>
                        <option value="Q2 or Q3">Q2 or Q3</option>
                        <option value="Q3 or Q4">Q3 or Q4</option>
                    </select>
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>client details</legend>
                    <input 
                        name="client_details" 
                        value={formValues.client_details} 
                        onChange={handleChange} 
                        placeholder="URL or Enter the details" 
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Curreny</legend>
                    <select 
                        name="currency" 
                        value={formValues.currency} 
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                       <option value="" disabled>Choose curreny</option>
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        {/* <option value="CHINA">CHINA</option> */}
                    </select>
                </fieldset>
                
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Bank account</legend>
                    <input 
                        name="bank_account" 
                        value={formValues.bank_account} 
                        onChange={handleChange} 
                        placeholder="xxxxxxxxx" 
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Payment Status</legend>
                    <select 
                        name="payment_status" 
                        value={formValues.payment_status} 
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                       <option value="" disabled>Choose status</option>
                        <option value="Not yet">Not yet</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                    </select>
                </fieldset>

               {/* <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Orders</legend>
                    <input 
                        name="orders" 
                        value={formValues.orders} 
                        onChange={handleChange} 
                        placeholder="EX: 10" 
                    />
                </fieldset> */}
                
            </div>
            
        </div>
    );
}
